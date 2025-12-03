// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
// 1. Import session logic from your utility file
import { getSession } from './app/Util/constants/session';
import {Role} from "@prisma/client";
import {LOGIN_URL, UNAUTH_URL} from "@/app/Util/constants/paths"; // Adjust the import path as necessary

interface ProtectedRouteConfig {
    // This now accepts an array of any valid Role value (USER, ADMIN, ROOT)
    roles: Role[];
    redirect: string;
}

// Define which roles have access to which routes
const PROTECTED_ROUTES: Record<string, ProtectedRouteConfig> ={
    // Example: Only logged-in users (any role) can access /dashboard
    '/dashboard': { roles: [Role.USER, Role.ADMIN, Role.ROOT], redirect: UNAUTH_URL },

    // Example: Only ADMIN can access /admin
    '/admin': { roles: [Role.ADMIN, Role.ROOT], redirect: UNAUTH_URL },

    // Example: ADMIN and MANAGER can access /management
    '/management': { roles: [Role.ADMIN, Role.ROOT], redirect: UNAUTH_URL },

    '/View/userProfile': { roles: [Role.ADMIN, Role.ROOT, Role.USER, Role.CUSTOMER], redirect: UNAUTH_URL },
};

// Define routes that should be inaccessible to logged-in users
const PUBLIC_ROUTES = [
    '/View/login',
    '/View/signUp'
];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = await getSession();
    const isLoggedIn = session.isLoggedIn;
    const userRole = session.user?.role;

    const url = request.nextUrl.clone();

    // -----------------------------------------------------------
    // 1. Handle Public Routes (Prevent access if logged in)
    // -----------------------------------------------------------
    if (isLoggedIn && pathname.startsWith(LOGIN_URL)) {
        // Redirect logged-in users trying to access login/signup pages to /
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    // -----------------------------------------------------------
    // 2. Handle Protected Routes (Check Authentication and Role)
    // -----------------------------------------------------------
    for (const route of Object.keys(PROTECTED_ROUTES) as Array<keyof typeof PROTECTED_ROUTES>) {
        if (pathname.startsWith(route)) {
            const { roles, redirect: redirectPath } = PROTECTED_ROUTES[route];

            // A. Check if user is logged in
            if (!isLoggedIn) {
                // If not logged in, redirect to the login page
                url.pathname = LOGIN_URL;
                return NextResponse.redirect(url);
            }

            // B. Check if user has the required role
            if (userRole && !roles.includes(userRole)) {
                // If logged in but doesn't have the role, redirect to the specified path (e.g., home)
                url.pathname = redirectPath;
                return NextResponse.redirect(url);
            }

            // If logged in and role is valid, allow access
            return NextResponse.next();
        }
    }

    // -----------------------------------------------------------
    // 3. Default: Allow access to all other routes (e.g., home page, static assets)
    // -----------------------------------------------------------
    return NextResponse.next();
}

// 3. Configure the middleware to only run on specific paths
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - Any file with an extension (like .css, .js, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
    ],
};