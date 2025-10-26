import {Role} from "@prisma/client";

export interface NavLink {
    label: string;
    href: string;
    hidden: boolean;
    roles?: Role[],
    requireAuth?: boolean
}
