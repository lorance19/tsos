import {z} from "zod";

export const createIssueSchema = z.object({
    title: z.string()
        .min(1, "Subject is required")
        .max(200, "Subject must be at most 200 characters"),
    description: z.string()
        .min(10, "Message must be at least 10 characters")
        .max(2000, "Message must be at most 2000 characters"),
});

export type CreateIssueFormData = z.infer<typeof createIssueSchema>;