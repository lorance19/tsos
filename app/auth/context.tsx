'use client';

import { createContext, useContext, ReactNode } from 'react';
import {IdAndRole} from "@prisma/client";


const AuthContext = createContext<{
    user: IdAndRole | null;
    isPending: boolean;
}>({
    user: null,
    isPending: true,
});

export function AuthProvider({
                                 children,
                                 user,
                                 isPending,
                             }: {
    children: ReactNode;
    user: IdAndRole | null;
    isPending: boolean;
}) {
    return (
        <AuthContext.Provider value={{ user, isPending}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
