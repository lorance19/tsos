"use client"
import React from 'react';
import RoleGuardComponent from "@/app/View/Component/RoleGuardComponent";
import {Role} from "@prisma/client";
import Link from "next/link";
import {ADMIN_MANAGEMENTS} from "@/app/Util/constants/paths";
import {usePathname} from "next/navigation";
import {IoMenuSharp} from "react-icons/io5";

function ManagementLayout({ children }: { children: React.ReactNode }) {
    const currentPath = usePathname();

    const handleLinkClick = () => {
        // Close the drawer on mobile after clicking a link
        const drawerToggle = document.getElementById('management-drawer') as HTMLInputElement;
        if (drawerToggle) {
            drawerToggle.checked = false;
        }
    };

    return (
        <div className="drawer lg:drawer-open">
            <input id="management-drawer" type="checkbox" className="drawer-toggle" />

            <div className="drawer-content flex flex-col">
                {/* Mobile hamburger button */}
                <div className="lg:hidden p-4">
                    <label htmlFor="management-drawer" aria-label="open sidebar" className="btn btn-square btn-ghost">
                        <IoMenuSharp className="text-5xl"/>
                    </label>
                </div>

                {/* Page content */}
                <RoleGuardComponent allowedRoles={[Role.ADMIN, Role.ROOT]}>
                    <div className="w-full">
                        {children}
                    </div>
                </RoleGuardComponent>
            </div>

            <div className="drawer-side z-[60] md:z-0">
                <label htmlFor="management-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                <aside className="bg-base-200 min-h-full w-64">
                    <nav className="menu w-full">
                        <ul className="menu w-full">
                            <li>
                                <Link
                                    className={currentPath.includes(ADMIN_MANAGEMENTS.USERS.VIEW) ? "menu-active" : ""}
                                    href={ADMIN_MANAGEMENTS.USERS.VIEW}
                                    onClick={handleLinkClick}
                                >
                                    Users
                                </Link>
                            </li>
                            <li>
                                <Link
                                    className={currentPath.includes(ADMIN_MANAGEMENTS.ISSUES.VIEW) ? "menu-active" : ""}
                                    href={ADMIN_MANAGEMENTS.ISSUES.VIEW}
                                    onClick={handleLinkClick}
                                >
                                    Issues
                                </Link>
                            </li>
                            <li>
                                <Link
                                    className={currentPath.includes(ADMIN_MANAGEMENTS.PRODUCTS.VIEW) ? "menu-active" : ""}
                                    href={ADMIN_MANAGEMENTS.PRODUCTS.VIEW}
                                    onClick={handleLinkClick}
                                >
                                    Manage Product
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </aside>
            </div>
        </div>
    );
}

export default ManagementLayout;