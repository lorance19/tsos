
// Helper function to extract credential and user ID
import {Credential} from "@/app/Util/constants/session";
import {NextResponse} from "next/server";
import {Role} from "@prisma/client";
import {getUserById} from "@/app/services/UserService";

export async function getCredentialAndUserId(context: { params: Promise<{ id: string }> }) {
    const cred = await Credential.init();
    const userMongoId = (await context.params).id;
    return { cred, userMongoId };
}

// Helper function to validate user ID
export function validateUserId(userMongoId: string | undefined) {
    if (!userMongoId) {
        return NextResponse.json(
            { error: "User ID is missing" },
            { status: 400 }
        );
    }
    return null;
}

// Helper function to check admin/root role
export function checkAdminRole(cred: Credential) {
    if (!cred.hasAnyRole([Role.ADMIN, Role.ROOT])) {
        return NextResponse.json(
            { error: "Access denied" },
            { status: 403 }
        );
    }
    return null;
}
