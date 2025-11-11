import {NextRequest, NextResponse} from "next/server";
import {makeZodError, parseRequestBodyZod} from "@/app/Util/zodUtil";
import {adminAddUserSchema} from "@/app/busniessLogic/User/userValidation";
import {createUserByAdmin, UserCreationError} from "@/app/services/UserService";
import {getCredential} from "@/app/Util/constants/session";

export async function POST(request: NextRequest) {
    try {
        const body = await parseRequestBodyZod(request, adminAddUserSchema)
        const {user, login} = await createUserByAdmin(body, await getCredential());
        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        if (error instanceof UserCreationError) {
            return NextResponse.json(
                makeZodError(error.field, error.message),
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }
        );
    }
}

