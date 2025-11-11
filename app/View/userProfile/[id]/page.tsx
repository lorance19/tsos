'use client'
import React, {useEffect, useState} from 'react';
import {useParams, useRouter} from "next/navigation";
import {useAuth} from "@/app/auth/context";
import {LOGIN_URL, UNAUTH_URL, UNEXPECTED_URL} from "@/app/Util/constants/paths";
import {Role} from "@prisma/client";
import UserProfileMain from "@/app/View/userProfile/[id]/UserProfileMain";



function UserProfile() {
    const params = useParams();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const userIdParam = params.id as string;
    const {user, isPending} = useAuth();

    useEffect(() => {
        if (isPending) {
            return;
        }
        if (!user || !user.userId) {
            router.replace(LOGIN_URL);
            return;
        }
        if (String(user.userId) !== userIdParam && user.role === Role.USER) {
            router.replace(UNAUTH_URL);
            return;
        }
        // Only set authorized to true if all checks pass
        setIsAuthorized(true);
    }, [isPending, user, userIdParam, router]);

    // Show loading state while checking auth or if not authorized
    if (isPending || !isAuthorized) {
        return <div className="p-8 text-center text-lg">Loading user profile...</div>;
    }

    return (

        <div className="p-8">
            <UserProfileMain id={userIdParam}/>
        </div>
    );
}

export default UserProfile;