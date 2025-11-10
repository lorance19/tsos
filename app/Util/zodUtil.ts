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

export async function parseRequestBodyZod<T extends z.ZodTypeAny>(
    req: Request,
    schema: T
): Promise<z.infer<T>> {
    const json = await req.json();
    const result = schema.safeParse(json);

    if (!result.success) {
        throw new Error(
            `Invalid request body: ${JSON.stringify(z.treeifyError(result.error), null, 2)}`
        );
    }

    return result.data;
}