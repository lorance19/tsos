import {NextRequest, NextResponse} from "next/server";
import {deleteUser, getUserById} from "@/app/services/UserService";
import {Credential} from "@/app/Util/constants/session";
import {Role} from "@prisma/client";

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

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const cred = await Credential.init();

    // Check if user has ADMIN or ROOT role
    if (!cred.hasAnyRole([Role.ADMIN, Role.ROOT])) {
        return NextResponse.json(
            { error: "Access denied" },
            { status: 403 }
        );
    }

    const userMongoId = (await context.params).id;

    if (!userMongoId) {
        return NextResponse.json(
            { error: "User ID is missing" },
            { status: 400 }
        );
    }

    try {
        const deletedUser = await deleteUser(userMongoId, cred.getUser());
        return NextResponse.json(
            { message: "User deleted successfully", user: deletedUser },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }
        );
    }
}