import {NextRequest, NextResponse} from "next/server";
import {getCredential, hasAnyRole} from "@/app/Util/constants/session";
import {Role} from "@prisma/client";
import {getAllUsersExceptId} from "@/app/services/UserService";

export async function GET(request: NextRequest) {
    const cred = await getCredential();
    if (! await hasAnyRole([Role.ADMIN, Role.ROOT])) {
        throw new Error("Access denied");
    }

    try {
        const users = await getAllUsersExceptId(cred!);
        return NextResponse.json(users, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 403 }
        );
    }
}