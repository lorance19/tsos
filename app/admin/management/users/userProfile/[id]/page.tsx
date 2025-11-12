'use client'
import React from 'react';
import {useParams} from "next/navigation";
import UserPersonalInfo from "@/app/admin/management/users/userProfile/[id]/UserPersonalInfo";

function UserProfileAdminView() {
    const params = useParams();
    const userIdParam = params.id as string;
    return (
        <div>
            <UserPersonalInfo id={userIdParam}/>
        </div>
    );
}

export default UserProfileAdminView;