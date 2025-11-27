import {NextRequest, NextResponse} from "next/server";
import {activateUser, deleteUser, getUserById, updateUser, UserCreationError} from "@/app/services/UserService";
import {Credential} from "@/app/Util/constants/session";
import {Role} from "@prisma/client";
import {editUserSchema} from "@/app/busniessLogic/User/userValidation";
import {makeZodError} from "@/app/Util/zodUtil";

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

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const cred = await Credential.init();
    const userMongoId = (await context.params).id;

    if (!userMongoId) {
        return NextResponse.json(
            { error: "User ID is missing" },
            { status: 400 }
        );
    }

    try {
        // Parse and validate request body
        const body = await request.json();
        const validationResult = editUserSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: validationResult.error.message },
                { status: 400 }
            );
        }

        // Update user with validated data
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
        // Handle field-specific validation errors
        if (error instanceof UserCreationError) {
            return NextResponse.json(
                { error: makeZodError(error.field, error.message) },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }
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

export async function PATCH(
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
        // Parse request body to determine action
        const body = await request.json();
        const { isActive } = body;

        if (typeof isActive !== 'boolean') {
            return NextResponse.json(
                { error: "isActive field is required and must be a boolean" },
                { status: 400 }
            );
        }

        // Call appropriate service function based on isActive value
        const updatedUser = isActive
            ? await activateUser(userMongoId, cred.getUser())
            : await deleteUser(userMongoId, cred.getUser());

        const message = isActive ? "User activated successfully" : "User deactivated successfully";

        return NextResponse.json(
            { message, user: updatedUser },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }
        );
    }
}