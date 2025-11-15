"use client"
import React from 'react';
import RoleGuardComponent from "@/app/View/Component/RoleGuardComponent";
import {Role} from "@prisma/client";
import Link from "next/link";
import {ADMIN_MANAGEMENTS} from "@/app/Util/constants/paths";
import {usePathname} from "next/navigation";

function ManagementLayout({ children }: { children: React.ReactNode }) {
    const currentPath = usePathname();
    return (
        <div className="drawer w-full flex min-h-screen">
            <aside className="w-64 bg-base-200 hidden md:block">
                <nav className="menu w-full">
                    <ul className="menu w-full">
                        <li>
                            <Link className={currentPath.includes(ADMIN_MANAGEMENTS.USERS.VIEW) ? "menu-active" : ""}
                                  href={ADMIN_MANAGEMENTS.USERS.VIEW}>Users
                            </Link>
                        </li>
                        <li>
                            <Link  className={currentPath.includes(ADMIN_MANAGEMENTS.ISSUES.VIEW) ? "menu-active" : ""}
                                   href={ADMIN_MANAGEMENTS.ISSUES.VIEW}>Issues
                            </Link>
                        </li>
                        <li>
                            <Link  className={currentPath.includes(ADMIN_MANAGEMENTS.PRODUCTS.VIEW) ? "menu-active" : ""}
                                   href={ADMIN_MANAGEMENTS.PRODUCTS.VIEW}>Manage Product</Link>
                        </li>
                    </ul>
                </nav>
            </aside>
            <RoleGuardComponent allowedRoles={[Role.ADMIN, Role.ROOT]}>
                <div className="w-full">
                    {children}
                </div>
            </RoleGuardComponent>
        </div>

    );
}

export default ManagementLayout;