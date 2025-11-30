import {NextRequest, NextResponse} from "next/server";
import {activateUser, deleteUser, updateUser, UserCreationError} from "@/app/services/UserService";
import {adminEditUserSchema} from "@/app/busniessLogic/User/userValidation";
import {makeZodError} from "@/app/Util/zodUtil";
import {checkAdminRole, getCredentialAndUserId, validateUserId} from "@/app/services/RoleAndCredentialCheck";
import {handleGetUserById} from "@/app/services/routeHandler/userRouteHandler";

export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    return handleGetUserById(context);
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { cred, userMongoId } = await getCredentialAndUserId(context);

    const validationError = validateUserId(userMongoId);
    if (validationError) return validationError;

    try {
        const body = await request.json();
        const validationResult = adminEditUserSchema.safeParse(body);

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
    _request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { cred, userMongoId } = await getCredentialAndUserId(context);

    const roleError = checkAdminRole(cred);
    if (roleError) return roleError;

    const validationError = validateUserId(userMongoId);
    if (validationError) return validationError;

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
    const { cred, userMongoId } = await getCredentialAndUserId(context);

    const roleError = checkAdminRole(cred);
    if (roleError) return roleError;

    const validationError = validateUserId(userMongoId);
    if (validationError) return validationError;

    try {
        const body = await request.json();
        const { isActive } = body;

        if (typeof isActive !== 'boolean') {
            return NextResponse.json(
                { error: "isActive field is required and must be a boolean" },
                { status: 400 }
            );
        }

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