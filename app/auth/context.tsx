'use client';

import { createContext, useContext, ReactNode } from 'react';
import {IdAndRole} from "@prisma/client";


const AuthContext = createContext<{
    user: IdAndRole | null;
}>({
    user: null,
});

export function AuthProvider({
                                 children,
                                 user,
                             }: {
    children: ReactNode;
    user: IdAndRole | null;
}) {
    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
