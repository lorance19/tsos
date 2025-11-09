import {z} from "zod";
import {createUserSchema} from "@/app/busniessLogic/User/userValidation";
import {useMutation} from "@tanstack/react-query";
import axios from "axios";
import {SIGN_UP} from "@/app/Util/constants/paths";
import prisma from "@/prisma/client";
import {LoginForm} from "@/app/View/login/page";
import {getUser} from "@/app/auth/login";
import {NextResponse} from "next/server";
import {makeZodError} from "@/app/Util/zodUtil";

type UserForm = z.infer<typeof createUserSchema>;

export function useSignUpUser() {
    return useMutation({
        mutationFn: async (data: UserForm) => {
            const res = await axios.post(SIGN_UP.API_PATH, data);
            if (res.status === 201) {
                return res.data;
            } else {
                throw new Error(res.statusText);
            }
        },
    });
}

export async function findUserById(userId: string) {
    return prisma.user.findUnique({where: {id: userId}});
}

export function userLogin() {
    return useMutation({
        mutationFn: async (data: LoginForm) => {
            return await getUser(data);
        }
    });
}