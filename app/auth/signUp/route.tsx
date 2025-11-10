import {NextRequest, NextResponse} from "next/server";
import prisma from "@/prisma/client";
import { hash } from 'bcryptjs';
import {createSession} from "@/app/Util/constants/session";
import {Role} from "@prisma/client";
import {makeZodError, parseRequestBodyZod} from "@/app/Util/zodUtil";
import {createUserSchema} from "@/app/busniessLogic/User/userValidation";
import {createUser, UserCreationError} from "@/app/services/UserService";



export async function POST(request: NextRequest) {
    try {
        // ✅ Validate & parse request body
        const body = await parseRequestBodyZod(request, createUserSchema);

        const {user, login} = await createUser(body, Role.CUSTOMER);
        const sees = await createSession({
            userId: login.userId,
            name: login.userName,
            role: user.role,
        });
        console.log(sees)
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