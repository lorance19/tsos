import {NextRequest, NextResponse} from "next/server";
import {getCredentialAndUserId, validateUserId} from "@/app/services/RoleAndCredentialCheck";
import {updateUser} from "@/app/services/UserService";
import {userEditUserSchema} from "@/app/busniessLogic/User/userValidation";

export async function PATCH(request: NextRequest,
                            context: { params: Promise<{ id: string }>} ) {
    const { cred, userMongoId } = await getCredentialAndUserId(context);
    const validationError = validateUserId(userMongoId);
    if (validationError) return validationError;
    if (cred.isUser() && cred.getUserId() !== userMongoId) {
        return NextResponse.json(
            { error: "You dont have permission to do this operation." },
            { status: 403 }
        );
    }

    try {
        const body = await request.json();
        const validationResult = userEditUserSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: validationResult.error.message },
                { status: 400 }
            );
        }

        const updatedUser = await updateUser(
            validationResult.data,
            cred,
            userMongoId
        );
        return NextResponse.json(
            { message: "User updated successfully", user: updatedUser },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 403 }
        );
    }
}