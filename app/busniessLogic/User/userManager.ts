import {z} from "zod";
import {createUserSchema} from "@/app/validation/createUser";
import {useMutation} from "@tanstack/react-query";
import axios from "axios";
import {SIGN_UP} from "@/app/Util/constants/paths";
import {IdAndRole} from "@prisma/client";
import {createSession} from "@/app/Util/constants/session";

type UserForm = z.infer<typeof createUserSchema>;

export function useCreateUser() {
    return useMutation({
        mutationFn: async (data: UserForm) => {
            const res = await axios.post(SIGN_UP.API_PATH, data);
            return res.data;
        },
    });
}