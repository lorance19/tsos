import {NextRequest, NextResponse} from "next/server";
import {getUserById} from "@/app/services/UserService";
import {Credential} from "@/app/Util/constants/session";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const cred = await Credential.init();

    const userMongoId = (await context.params).id;

    if (!userMongoId) {
        return NextResponse.json(
            { error: "MongoId is missing" },
            { status: 403 }
        );
    }
    if (cred.isUser() && cred.getUserId() !== userMongoId) {
        throw new Error("Access denied");
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