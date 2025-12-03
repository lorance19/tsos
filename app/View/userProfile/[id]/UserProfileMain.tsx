'use client'
import React from 'react';
import {useGetUserById} from "@/app/busniessLogic/User/userManager";
import { AxiosError } from 'axios';
import Unexpected from "@/app/View/unexpectedError/page";
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaCalendar,
    FaUserShield,
    FaCheckCircle,
    FaTimesCircle,
    FaLocationArrow, FaEdit
} from "react-icons/fa";
import {FaLocationPin} from "react-icons/fa6";
import Link from "next/link";
import {EDIT_PROFILE} from "@/app/Util/constants/paths";


function UserProfileMain({id}: { id: string }) {

    const { data: user, isLoading, error } = useGetUserById(id);
    if (isLoading) {
        return <p>Loading Profile ... </p>
    }
    if (error) {
        console.error(error);
        return <Unexpected axiosError={error as AxiosError} />;
    }

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Not Set';
    const address = [user.address?.street1, user.address?.street2, user.address?.city, user.address?.zip, user.address?.country]
            .filter(Boolean).join(' ') || "Missing";
    const formatDate = (date: string | Date) => new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });


    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
            {/* General Profile Section */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="flex justify-between card-title text-2xl font-montserrat mb-4 pb-2">
                        General Profile Information
                        <Link href={EDIT_PROFILE(id).VIEW} className="text-lg link text-secondary hover:underline"> <FaEdit/></Link>
                    </div>

                    {/* User Info Fields */}
                    <div className="space-y-4 ">
                        {/* Full Name */}
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors">
                            <FaUser className=" text-lg flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs text-base-content/60 uppercase tracking-wide">Full Name</p>
                                <p className={`font-medium ${!user.firstName && !user.lastName ? 'text-error italic' : ''}`}>
                                    {fullName}
                                </p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors">
                            <FaEnvelope className=" text-lg flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs text-base-content/60 uppercase tracking-wide">Email</p>
                                <p className="font-medium break-all">{user.email}</p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors">
                            <FaPhone className=" text-lg flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs text-base-content/60 uppercase tracking-wide">Phone</p>
                                <p className={`font-medium ${!user.phone ? 'text-error italic' : ''}`}>
                                    {user.phone || 'Not Set'}
                                </p>
                            </div>
                        </div>

                        {/* Account Status */}
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors">
                            {user.isActive ? (
                                <FaCheckCircle className="text-success text-lg flex-shrink-0" />
                            ) : (
                                <FaTimesCircle className="text-error text-lg flex-shrink-0" />
                            )}
                            <div className="flex-1">
                                <p className="text-xs text-base-content/60 uppercase tracking-wide">Account Status</p>
                                <span className={`${user.isActive ? 'text-success' : 'text-error'}`}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        {/* Created Date */}
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors">
                            <FaCalendar className="text-lg flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs text-base-content/60 uppercase tracking-wide">Member Since</p>
                                <p className="font-medium">{formatDate(user.createdAt)}</p>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors">
                            <FaLocationPin className="text-lg flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs text-base-content/60 uppercase tracking-wide">Address</p>
                                <span className={`${user.address ? '' : 'text-error'}`}>
                                    {address}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Second Section Placeholder */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="card-title text-2xl mb-4 font-montserrat pb-2">Orders from Past 30 Days</div>
                    <p className="text-base-content/60">Content coming soon...</p>
                </div>
            </div>

        </div>
    );
}

export default UserProfileMain;