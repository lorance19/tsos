'use client'
import React, {useEffect} from 'react';
import {useParams, useRouter} from "next/navigation";
import {useAuth} from "@/app/auth/context";
import {UNAUTH_URL} from "@/app/Util/constants/paths";

function UserProfile() {
    const params = useParams();
    const router = useRouter();

    const userIdParam = params.id as string;

    const { user, isPending } = useAuth();
    useEffect(() => {
        if (isPending) {
            return;
        }
        if (!user || !user.userId) {
            router.replace(UNAUTH_URL);
            return;
        }
        if (String(user.userId) !== userIdParam) {
            router.replace(UNAUTH_URL);
            return;
        }
    }, [isPending, user, userIdParam, router]);// Dependency array: Re-run when these values change

    if (isPending) {
        return <div className="p-8 text-center text-lg">Loading user profile...</div>;
    }

    return (
        <div>user with id ${userIdParam}</div>
    );
}

export default UserProfile;