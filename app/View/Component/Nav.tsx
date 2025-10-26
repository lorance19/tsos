'use client'
import React, {useTransition} from 'react';
import {NavLink} from "@/app/View/Component/utilties/NavLink";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {LOGIN_URL, LOGOUT, SIGN_UP} from "@/app/Util/constants/paths";
import {Role} from "@prisma/client";
import {useAuth} from "@/app/auth/context";
import {deleteSession} from "@/app/Util/constants/session";
import {signOut} from "@/app/auth/logout";
import SignOutButton from "@/app/View/Component/SignOutButton";

function Nav() {
    const { user } = useAuth();
    const currentPath = usePathname();
    // Define all possible links with role-based visibility
    const allLinks: NavLink [] = [
        {label: 'Thit Ser', href: '/', hidden: true},
        {label: 'Home', href:'/kk', hidden: false},
        {label: 'Product', href:'/ss', hidden: false},
        {label: 'Contact Us', href:'/dd', hidden: false},

        // Public links (only show when NOT logged in)
        {label: 'Login', href: LOGIN_URL, hidden: false, requireAuth: false},

        // Admin only links
        {label: 'Management', href: '/admin/management', hidden: false, roles: [Role.ADMIN]},
        {label: 'Users', href: '/admin/users', hidden: false, roles: [Role.ADMIN]},

        // Admin and Moderator links
        {label: 'Reports', href: '/reports', hidden: false, roles: [Role.ADMIN]},

        // Authenticated user links (show when logged in)
        // {label: 'Logout', href: LOGOUT.VIEW_PATH, hidden: false, requireAuth: true, customCss: "text-red-500"},
    ];

    // Filter links based on user session and role
    const visibleLinks = allLinks.filter(link => {
        // Always hide if explicitly hidden
        if (link.hidden) return false;

        // If link requires specific roles
        if (link.roles && link.roles.length > 0) {
            if (!user) return false; // Not logged in
            return link.roles.includes(user.role);
        }

        // If link requires authentication
        if (link.requireAuth === true) {
            return !!user; // Only show if logged in
        }

        // If link is for non-authenticated users only (Login/SignUp)
        if (link.requireAuth === false) {
            return !user; // Only show if NOT logged in
        }
        // Default: show to everyone
        return true;
    });

    return (
        <div className="sticky top-0 z-50 flex flex-col bg-base-200 shadow-md">
            <div className="flex justify-center pt-5" >
                <Link href={allLinks.at(0)!.href} className="text-5xl font-serif my-3 text-secondary-content">{allLinks.at(0)!.label}</Link>
            </div>
            <nav className="flex justify-center p-4 font-serif  ">
                <ul className="flex gap-6">
                    {visibleLinks.map(link =>
                        <Link href={link.href} key={link.href}
                              className={`
                                ${link.hidden ? "hidden" : ""}
                                ${link.href === currentPath ? "text-secondary" : "text-black" }
                              hover:text-secondary transition delay-70 duration-150 hover:scale-110`}
                        >
                            {link.label}
                        </Link>)}
                    {user && <SignOutButton />}
                </ul>
            </nav>
        </div>
    );
}

export default Nav;