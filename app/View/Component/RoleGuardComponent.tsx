'use client'
import React, {useEffect} from 'react';
import { Role } from '@prisma/client';
import Unauthorized from "@/app/View/unauthorized/page";
import {useAuth} from "@/app/auth/context";
import {LOGIN_URL} from "@/app/Util/constants/paths";
import {useRouter} from "next/navigation";
import _ from "lodash";



interface RoleGuardProps {
    allowedRoles: Role[];
    fallback?: React.ReactNode; // Shown if not allowed
    children: React.ReactNode;
}

function RoleGuardComponent({ allowedRoles, fallback = <Unauthorized/>, children }: RoleGuardProps) {
    const router = useRouter();
    const {user, isPending} = useAuth();
    useEffect(() => {
        if (isPending) {
            return;
        }
        if (!user) {
            router.replace(LOGIN_URL);
            return;
        }
    }, [isPending, user, router]);// Dependency array: Re-run when these values change

    if (isPending) {
        return <div className="p-8 text-center text-lg">Loading...</div>;
    }

    if (!allowedRoles.includes(user!.role)) {
        return (
            <>{fallback}</>
        )
    }
    return <>{children}</>
}

export default RoleGuardComponent;