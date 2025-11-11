import { getIronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';
import {IdAndRole, Role} from "@prisma/client";


export interface SessionData {
    user?: IdAndRole;
    isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
    password: process.env.SESSION_SECRET!,
    cookieName: 'app_session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    },
};

export async function getSession() {
    const cookieStore = await cookies();
    return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function getCredential(): Promise<IdAndRole | null> {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
        return null;
    }
    return session.user;
}

export async function requireAuth(): Promise<IdAndRole> {
    const credential = await getCredential();
    if (!credential) {
        throw new Error('Unauthorized');
    }
    return credential;
}

export async function hasRole(role: Role): Promise<boolean> {
    const credential = await getCredential();
    return credential?.role === role;
}

export async function hasAnyRole(roles: Role[]): Promise<boolean> {
    const credential = await getCredential();
    return credential ? roles.includes(credential.role) : false;
}


export async function requireRole(role: Role): Promise<IdAndRole> {
    const credential = await requireAuth();
    if (credential.role !== role) {
        throw new Error('Forbidden');
    }
    return credential;
}

export async function createSession(user: IdAndRole): Promise<void> {
    const session = await getSession();
    session.user = user;
    session.isLoggedIn = true;
    await session.save();
}

export async function deleteSession(): Promise<void> {
    const session = await getSession();
    session.destroy();
}

export async function refreshSession(): Promise<void> {
    const session = await getSession();
    if (session.isLoggedIn) {
        await session.save();
    }
}

export class Credential {
    private user: IdAndRole | null;

    private constructor(user: IdAndRole | null) {
        this.user = user;
    }

    static async init(): Promise<Credential> {
        const user = await getCredential();
        return new Credential(user);
    }

    isLoggedIn(): boolean {
        return this.user !== null;
    }

    isRoot(): boolean {
        return this.user?.role === Role.ROOT;
    }

    isAdmin(): boolean {
        return this.user?.role === Role.ADMIN;
    }

    isUser(): boolean {
        return this.user?.role === Role.USER;
    }

    hasRole(role: Role): boolean {
        return this.user?.role === role;
    }

    hasAnyRole(roles: Role[]): boolean {
        return this.user ? roles.includes(this.user.role) : false;
    }

    getUserId(): string | undefined {
        return this.user?.userId;
    }

    getRole(): Role | undefined {
        return this.user?.role;
    }

    getUser(): IdAndRole | null {
        return this.user;
    }

    requireAuth(): IdAndRole {
        if (!this.user) {
            throw new Error('Unauthorized');
        }
        return this.user;
    }

    requireRole(role: Role): IdAndRole {
        const user = this.requireAuth();
        if (user.role !== role) {
            throw new Error('Forbidden');
        }
        return user;
    }
}




