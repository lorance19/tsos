'use client'
import React from 'react';
import {useGetUserById} from "@/app/busniessLogic/User/userManager";
import { AxiosError } from 'axios';
import Unexpected from "@/app/View/unexpectedError/page";

interface UserProfileProps {
    id: string
}

function UserProfileMain({id}: UserProfileProps) {
    const { data: user, isLoading, error } = useGetUserById(id);
    if (isLoading) {
        return <p>Loading Profile ... </p>
    }
    if (error) {
        console.error(error);
        return <Unexpected axiosError={error as AxiosError} />;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">User Profile</h1>
            <div className="space-y-2">
                <p><strong>User ID:</strong> {id}</p>
                {/* Display fetched profile data */}
                {user && (
                    <>
                        <p><strong>Name:</strong> {user.firstName + " " + user.firstName} </p>
                        <p><strong>Email:</strong> {user.email}</p>
                        {/* Add more fields as needed */}
                    </>
                )}
            </div>
        </div>
    );
}

export default UserProfileMain;