import {NextRequest, NextResponse} from "next/server";
import {createUserSchema} from "@/app/validation/createUser";
import prisma from "@/prisma/client";
import { hash } from 'bcryptjs';
import {z, ZodError} from "zod";
import {parseRequestBodyZod} from "@/app/Util/parseRequestBodyZod";
import {createSession, deleteSession, getSession} from "@/app/Util/constants/session";
import {Role} from "@prisma/client";



// Utility to create a ZodError and format
function makeZodError(path: string, message: string) {
    return z.treeifyError(new ZodError([
        {
            code: 'custom', // ← use literal string instead of ZodIssueCode.custom
            path: [path],
            message,
        },
    ]));

}

export async function POST(request: NextRequest) {
    try {
        // ✅ Validate & parse request body
        const body = await parseRequestBodyZod(request, createUserSchema);

        // ✅ Check if email exists
        const isExistingEmail = await prisma.login.count({
            where: { communicationChannel: body.email }
        });

        if (isExistingEmail > 0) {
            return NextResponse.json(makeZodError(createUserSchema.keyof().enum.email, "A user with this email already exists"), { status: 400 });
        }

        // ✅ Check if username exists
        const isExistingUsername = await prisma.login.count({
            where: { userName: body.userName }
        });
        if (isExistingUsername > 0) {
            return NextResponse.json(makeZodError(createUserSchema.keyof().enum.userName, "Please choose a different username"), { status: 400 });
        }

        // ✅ Hash password
        const hashedPassword = await hash(body.password, 10);

        // ✅ Create user
        const newUser = await prisma.user.create({
            data: { email: body.email, role: Role.ADMIN },
        });

        if (!newUser.id || !newUser.role) {
            throw new Error("User ID or Role is missing");
        }

        // ✅ Create login record
        const user = await prisma.login.create({
            data: {
                userId: newUser.id,
                role: newUser.role,
                password: hashedPassword,
                communicationChannel: newUser.email,
                userName: body.userName
            }
        });
        const sees = await createSession({
            userId: user.userId,
            name: user.userName,
            role: user.role,
        });
        console.log(sees)
        return NextResponse.json(newUser, { status: 201 });

    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }
        );
    }
}