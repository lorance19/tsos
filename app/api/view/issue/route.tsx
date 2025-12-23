import {NextRequest, NextResponse} from "next/server";
import {makeZodError, parseRequestBodyZod} from "@/app/Util/zodUtil";
import {createIssueSchema} from "@/app/busniessLogic/Issue/issueValidation";
import {createIssue, IssueCreationError} from "@/app/services/IssueService";

export async function POST(request: NextRequest) {
    try {
        const body = await parseRequestBodyZod(request, createIssueSchema);
        const issue = await createIssue(body);
        return NextResponse.json(issue, { status: 201 });
    } catch (error) {
        if (error instanceof IssueCreationError) {
            return NextResponse.json(
                makeZodError(error.field, error.message),
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }
        );
    }
}