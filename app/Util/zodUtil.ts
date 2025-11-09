import {z, ZodError} from "zod";


export function makeZodError(path: string, message: string) {
    return z.treeifyError(new ZodError([
        {
            code: 'custom', // ← use literal string instead of ZodIssueCode.custom
            path: [path],
            message,
        },
    ]));
}