
import {z} from "zod";

export const createUserSchema = z.object({
    userName: z.string().min(1, "Username is required").max(25, "Username is too long!"),
    email: z.email("Please enter valid email"),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string()
})
    // 2. Add the cross-field refinement (passwords match)
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
    })
    // 3. Add environment-specific refinements using .superRefine()
    .superRefine((data, ctx) => {
        // Check if we are in a production-like environment
        if (process.env.NEXT_PUBLIC_ENVIRONMENT !== "development") {

            // Check requirement 1: Minimum length
            if (data.password.length < 10) {
                ctx.addIssue({
                    code: "custom",
                    message: "Password must be at least 10 characters long",
                    path: ["password"],
                });
                // Stop checking if the length check fails
                return;
            }

            // Check requirement 2: Capital letter
            if (!/[A-Z]/.test(data.password)) {
                ctx.addIssue({
                    code: "custom",
                    message: "Password must contain at least one capital letter",
                    path: ["password"],
                });
            }
        }
        // Note: If in "development", no additional checks are performed.
    });

export const userLoginValidationSchema = z.object({
    username: z.string().min(1, "Username is required").max(30),
    password: z.string().min(1, "Password is required")
})
export const userLoginValidationSchemaKey = userLoginValidationSchema.keyof().enum;

