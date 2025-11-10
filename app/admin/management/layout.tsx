import React from 'react';
import RoleGuardComponent from "@/app/View/Component/RoleGuardComponent";
import {Role} from "@prisma/client";
import Link from "next/link";
import {ADMIN_MANAGEMENTS} from "@/app/Util/constants/paths";

function ManagementLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full flex min-h-screen">
            <aside className="w-64 bg-base-200 p-4 hidden md:block">
                <nav className="menu space-y-2">
                    <ul>
                        <li>
                            <Link className="link link-hover" href={ADMIN_MANAGEMENTS.USERS.VIEW}>Users</Link>
                        </li>
                        <li>
                            <Link className="link link-hover" href={ADMIN_MANAGEMENTS.ISSUES.VIEW}>Issues</Link>
                        </li>
                        <li>
                            <Link className="link link-hover" href={ADMIN_MANAGEMENTS.PRODUCTS.VIEW}>Manage Product</Link>
                        </li>
                    </ul>
                </nav>
            </aside>
            <RoleGuardComponent allowedRoles={[Role.ADMIN, Role.ROOT]}>
                {children}
            </RoleGuardComponent>
        </div>

    );
}

export default ManagementLayout;