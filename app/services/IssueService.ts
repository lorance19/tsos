import {z} from "zod";
import {createIssueSchema} from "@/app/busniessLogic/Issue/issueValidation";
import prisma from "@/prisma/client";

type CreateIssueForm = z.infer<typeof createIssueSchema>;

export class IssueCreationError extends Error {
    constructor(public field: string, message: string) {
        super(message);
        this.name = 'IssueCreationError';
    }
}

export async function createIssue(data: CreateIssueForm) {
    try {
        const issue = await prisma.issue.create({
            data: {
                title: data.title,
                description: data.description,
            }
        });
        return issue;
    } catch (error) {
        throw new IssueCreationError('general', 'Failed to create issue');
    }
}

export async function getAllIssues() {
    return prisma.issue.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });
}

export async function getIssueById(id: string) {
    return prisma.issue.findUnique({
        where: { id }
    });
}