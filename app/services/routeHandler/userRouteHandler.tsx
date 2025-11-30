import {getCredentialAndUserId, validateUserId} from "@/app/services/RoleAndCredentialCheck";
import {NextResponse} from "next/server";
import {getUserById} from "@/app/services/UserService";

export async function handleGetUserById(context: { params: Promise<{ id: string }> }) {
    const { cred, userMongoId } = await getCredentialAndUserId(context);

    const validationError = validateUserId(userMongoId);
    if (validationError) return validationError;

    // Users can only access their own data unless they're admin/root
    if (cred.isUser() && cred.getUserId() !== userMongoId) {
        return NextResponse.json(
            { error: "Access denied" },
            { status: 403 }
        );
    }

    try {
        const user = await getUserById(userMongoId);
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 403 }
        );
    }
}