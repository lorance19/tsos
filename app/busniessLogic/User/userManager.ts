import {z} from "zod";
import {adminAddUserSchema, createUserSchema} from "@/app/busniessLogic/User/userValidation";
import {useMutation} from "@tanstack/react-query";
import axios from "axios";
import {ADMIN_MANAGEMENTS, SIGN_UP} from "@/app/Util/constants/paths";
import prisma from "@/prisma/client";
import {LoginForm} from "@/app/View/login/page";
import {getUser} from "@/app/auth/login";


type UserForm = z.infer<typeof createUserSchema>;
type CreateUserForm = z.infer<typeof adminAddUserSchema>;

export function useSignUpUser() {
    return useMutation({
        mutationFn: async (data: UserForm) => {
            const res = await axios.post(SIGN_UP.API, data);
            if (res.status === 201) {
                return res.data;
            } else {
                throw new Error(res.statusText);
            }
        },
    });
}

export function useCreateUser() {
    return useMutation({
        mutationFn: async (data: CreateUserForm) => {
            const res = await axios.post(ADMIN_MANAGEMENTS.ADD_USER.API, data);
            if (res.status === 201) {
                return res.data;
            } else {
                throw new Error(res.statusText);
            }
        }
    })
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