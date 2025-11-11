import {z} from "zod";
import {adminAddUserSchema, createUserSchema} from "@/app/busniessLogic/User/userValidation";
import {useMutation, useQuery} from "@tanstack/react-query";
import axios from "axios";
import {ADMIN_MANAGEMENTS, SIGN_UP, USER_PROFILE} from "@/app/Util/constants/paths";
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


export function userLogin() {
    return useMutation({
        mutationFn: async (data: LoginForm) => {
            return await getUser(data);
        }
    });
}
export function useGetUserById(userId: string) {
    return useQuery({
        queryKey: [GET_USER_BY_ID_QUERY_KEY + userId],
        queryFn: async() => {
            const res = await axios.get(USER_PROFILE.API + userId);
            return res.data;
        },
        enabled: !!userId, // Only fetch if userId exists
    })
}

export function useGetAllUsers() {
    return useQuery({
        queryKey: [GET_ALL_USERS_QUERY_KEY],
        queryFn: async() => {
            const res = await axios.get(ADMIN_MANAGEMENTS.USERS.API)
            return res.data;
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    })
}

export const GET_ALL_USERS_QUERY_KEY = "users";
export const GET_USER_BY_ID_QUERY_KEY = "user-";