import {z} from "zod";
import {Role} from "@prisma/client";

export const createIssueSchema = z.object({
    name: z.string()
        .min(1, "Name is required")
        .max(100, "Name must be at most 100 characters"),
    email: z.email("Email is required"),
    title: z.string()
        .min(1, "Subject is required")
        .max(200, "Subject must be at most 200 characters"),
    description: z.string()
        .min(10, "Message must be at least 10 characters")
        .max(2000, "Message must be at most 2000 characters"),
    role: z.enum(Role).optional(),
});

export type CreateIssueFormData = z.infer<typeof createIssueSchema>;