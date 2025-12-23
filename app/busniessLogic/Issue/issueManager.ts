import {z} from "zod";
import {createIssueSchema} from "@/app/busniessLogic/Issue/issueValidation";
import {useMutation} from "@tanstack/react-query";
import axios from "axios";
import {CONTACT_US} from "@/app/Util/constants/paths";

type CreateIssueForm = z.infer<typeof createIssueSchema>;

export function useCreateIssue() {
    return useMutation({
        mutationFn: async (data: CreateIssueForm) => {
            const res = await axios.post(CONTACT_US.API, data);
            if (res.status === 201) {
                return res.data;
            } else {
                throw new Error(res.statusText);
            }
        },
    });
}