'use client'
import React, {useEffect, useState} from 'react';
import Link from "next/link";
import {usePathname,} from "next/navigation";
import {LOGIN_URL, PRODUCT, USER_PROFILE} from "@/app/Util/constants/paths";
import {Role} from "@prisma/client";
import {useAuth} from "@/app/auth/context";

import SignOutButton from "@/app/View/Component/SignOutButton";
import {LuShoppingCart} from "react-icons/lu";
import {useCartContext} from "@/app/View/product/CartContext";

export interface NavLink {
    label: string;
    href: string;
    hidden: boolean;
    roles?: Role[],
    requireAuth?: boolean
}

function Nav() {
    const { user } = useAuth();
    const { toggleCart, cartCount } = useCartContext();
    const currentPath = usePathname();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show nav when scrolling up, hide when scrolling down
            if (currentScrollY < lastScrollY || currentScrollY < 10) {
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY]);
    // Define all possible links with role-based visibility
    const allLinks: NavLink [] = [
        {label: 'Thit Ser', href: '/', hidden: true},
        {label: 'Home', href:'/', hidden: false},
        {label: 'Product', href: PRODUCT.LIST.VIEW, hidden: false},
        {label: 'Contact Us', href:'/View/Contact Us', hidden: false},

        // Public links (only show when NOT logged in)
        {label: 'Login', href: LOGIN_URL, hidden: false, requireAuth: false},

        // Admin only links
        {label: 'Management', href: '/admin/management', hidden: false, roles: [Role.ADMIN, Role.ROOT]},
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
        <div className={`sticky top-0 z-40 flex flex-col bg-base-200 shadow-md transition-transform duration-300 ease-in-out ${
            isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}>
            <div className="flex justify-center pt-5" >
                <Link href={allLinks.at(0)!.href} className="text-5xl font-serif my-3 text-secondary-content">{allLinks.at(0)!.label}</Link>
            </div>
            <nav className="grid grid-cols-6 p-4 font-serif px-8">
                <div className="col-span-1"></div>
                <div className="col-span-4">
                    <ul className="flex gap-6 flex-1 justify-center">
                        <Link href={allLinks[1].href} key={allLinks[0].href}
                              className={`hover:text-secondary transition delay-70 duration-150 hover:scale-110`}
                        >{allLinks[1].label}</Link>
                        {visibleLinks.filter(link => link.label !== "Home").map(link =>
                            <Link href={link.href} key={link.href}
                                  className={`
                                ${link.hidden ? "hidden" : ""}
                                ${currentPath.includes(link.href) ? "text-secondary" : "text-black" }
                              hover:text-secondary transition delay-70 duration-150 hover:scale-110`}
                            >
                                {link.label}
                            </Link>)}
                        {user && <Link className={`${currentPath.includes(USER_PROFILE(user.userId).VIEW) ? "text-secondary" : "text-black"} hover:text-secondary transition delay-70 duration-150 hover:scale-110`} href={`/View/userProfile/${user.userId}`} key={`user-profile-${user.userId}`}>Profile</Link>}
                        {user && <SignOutButton />}
                    </ul>
                </div>
                <div className="flex-1 flex justify-end">
                    <button
                        onClick={toggleCart}
                        className="relative hover:cursor-pointer hover:text-secondary transition-colors p-1"
                    >
                        <LuShoppingCart className="h-7 w-7" />
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center p-1 text-xs leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                            {cartCount}
                             </span>
                        )}
                    </button>
                </div>
            </nav>
        </div>
    );
}

export default Nav;