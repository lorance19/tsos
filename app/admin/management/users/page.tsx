'use client'
import React, {useState} from 'react';
import { FaUser } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { IoMdPersonAdd } from "react-icons/io";
import Link from "next/link";
import {ADMIN_MANAGEMENTS} from "@/app/Util/constants/paths";
import {useDeactivateUser, useGetAllUsers} from "@/app/busniessLogic/User/userManager";
import {Role} from "@prisma/client";
import {useQueryClient} from "@tanstack/react-query";
import {GET_ALL_USERS_QUERY_KEY} from "@/app/busniessLogic/User/userManager";
import {useToastNotifications} from "@/app/Util/toast";
import UnexpectedError from "@/app/View/Component/UnexpectedError";
import SuccessToast from "@/app/View/Component/SuccessToast";
import ConfirmModal from "@/app/View/Component/ConfirmModal";

interface UserInfo {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: Role;
    isActive: boolean;
    login: { userName: string; };
}

function Page() {
    const { data: users, isLoading, error } = useGetAllUsers();
    const [searchTerm, setSearchTerm] = useState("");
    const [userToDelete, setUserToDelete] = useState<UserInfo | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const queryClient = useQueryClient();
    const deleteMutation = useDeactivateUser();
    const { error: errorMessage, toastMessage, showError, showSuccess } = useToastNotifications();

    // Filter users based on search
    const filteredUsers = users?.filter((user: UserInfo) =>
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.login?.userName?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const ROLE_BADGE_COLORS: Record<Role, string> = {
        [Role.ADMIN]: 'badge-secondary',
        [Role.CUSTOMER]: 'badge-info',
        [Role.ROOT]: 'badge-danger',
        [Role.USER]: 'badge-ghost',
    };

    const handleDeleteClick = (user: UserInfo) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        try {
            await deleteMutation.mutateAsync(userToDelete.id);
            showSuccess("User deleted successfully");
            await queryClient.invalidateQueries({ queryKey: [GET_ALL_USERS_QUERY_KEY] });
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        } catch (error) {
            showError((error as Error).message || "Failed to delete user");
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    return (
        <div className="p-2 m-2 w-full">
            <div className="flex flex-row justify-between align-items-center">
                <p className="flex items-center text-2xl font-semibold">
                    <FaUser className="mx-2"/>
                    <span>Users</span>
                </p>
                <div className="grid grid-cols-3 gap-2">
                    <label className="input col-span-2">
                        <CiSearch />
                        <input
                            type="search"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </label>
                    <Link className="btn btn-primary rounded-full" href={ADMIN_MANAGEMENTS.ADD_USER.VIEW}><IoMdPersonAdd className="text-xl"/></Link>
                </div>
            </div>
            <div className="overflow-x-auto my-3 rounded-box border border-base-content/5 bg-base-100">
                <table className="table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Phone</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading && (
                        <tr>
                            <td colSpan={7} className="text-center">
                                <span className="loading loading-spinner loading-md"></span>
                            </td>
                        </tr>
                    )}

                    {error && (
                        <tr>
                            <td colSpan={7} className="text-center text-error">
                                Failed to load users
                            </td>
                        </tr>
                    )}

                    {!isLoading && !error && filteredUsers.length === 0 && (
                        <tr>
                            <td colSpan={7} className="text-center">
                                No users found
                            </td>
                        </tr>
                    )}

                    {!isLoading && !error && filteredUsers.map((user: UserInfo, index: number) => (
                        <tr key={index} className={`${user.isActive ? "" : "bg-red-100"}`}>
                            <th>{index + 1}</th>
                            <td>
                                <Link className={`${user.isActive ? "link-secondary" : "link-error"} hover:link-primary`} href={ADMIN_MANAGEMENTS.USER_PROFILE(user.id).VIEW}>{user.firstName} {user.lastName}</Link>

                            </td>
                            <td>{user.login?.userName || '-'}</td>
                            <td>{user.email}</td>
                            <td>

                                    <span className={`badge ${ROLE_BADGE_COLORS[user.role]} badge-xs`}>
                                        {user.role}
                                    </span>

                            </td>
                            <td>{user.phone || '-'}</td>
                            <td>
                                <Link href={ADMIN_MANAGEMENTS.USER_PROFILE(user.id).VIEW} className="btn btn-ghost btn-sm">Edit</Link>
                                <button
                                    className="btn btn-ghost btn-sm text-error"
                                    onClick={() => handleDeleteClick(user)}
                                    disabled={deleteMutation.isPending}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                modalProps={{
                    header: "Confirm Delete",
                    message: `Are you sure you want to delete user ${userToDelete?.firstName} ${userToDelete?.lastName} (${userToDelete?.email})?`,
                    yes: "Delete",
                    no: "Cancel",
                    disableSubmit: deleteMutation.isPending
                }}
            />

            {/* Toast Notifications */}
            <UnexpectedError errorMessage={errorMessage} />
            <SuccessToast toastMessage={toastMessage} />
        </div>
    );
}

export default Page;