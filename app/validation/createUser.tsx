
import {z} from "zod";

export const createUserSchema = z.object({
    userName: z.string().min(1, "Username is required").max(25, "Username is too long!"),
    email: z.email("Please enter valid email"),
    password: z.string().min(10, "Password must be at least 10 characters long")
        .refine((password) => /[A-Z]/.test(password), "Password must contain at least one capital letter"),
    confirmPassword: z.string()}).refine((data) => data.password === data.confirmPassword, {
    message:"Passwords dont match",
    path:["confirmPassword"]
})
