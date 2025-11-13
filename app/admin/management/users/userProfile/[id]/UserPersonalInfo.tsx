'use client'
import React, {useEffect, useState} from 'react';
import {GET_USER_BY_ID_QUERY_KEY, useGetUserById, useUpdateUser} from "@/app/busniessLogic/User/userManager";
import {editUserSchema} from "@/app/busniessLogic/User/userValidation";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {COUNTRY} from "@/app/Util/constants/country";
import UserInfoFormFields from "./UserInfoFormFields";
import {AiOutlineLoading3Quarters} from "react-icons/ai";
import {useToastNotifications} from "@/app/Util/toast";
import UnexpectedError from "@/app/View/Component/UnexpectedError";
import SuccessToast from "@/app/View/Component/SuccessToast";
import {useQueryClient} from "@tanstack/react-query";
import ConfirmModal from "@/app/View/Component/ConfirmModal";

interface UserProfileProps {
    id: string
}
type editUserForm = z.infer<typeof editUserSchema>;

function UserPersonalInfo({id}: UserProfileProps) {
    const queryClient = useQueryClient();
    const { data: user, isLoading } = useGetUserById(id);
    const updateUserMutation = useUpdateUser(id);
    const {register, handleSubmit, formState: { errors }, reset} = useForm<editUserForm>({
        resolver: zodResolver(editUserSchema)
    });
    const { error: toastError, toastMessage, showError, showSuccess } = useToastNotifications();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingData, setPendingData] = useState<editUserForm | null>(null);

    // Update form values when user data loads
    useEffect(() => {
        if (user) {
            reset({
                userName: user.login?.userName || '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                email: user.email || '',
                role: user.role,
                address: {
                    street1: user.address?.street1 || '',
                    street2: user.address?.street2 || '',
                    city: user.address?.city || '',
                    zip: user.address?.zip || '',
                    country: (user.address?.country as COUNTRY) || undefined
                }
            });
        }
    }, [user, reset]);

    // Show confirmation modal when form is submitted
    const onSubmit = (data: editUserForm) => {
        setPendingData(data);
        setIsConfirmOpen(true);
    };

    // Handle confirmation - actually submit the data
    const handleConfirm = async () => {
        if (!pendingData) return;

        try {
            await updateUserMutation.mutateAsync(pendingData);

            // Invalidate and refetch user data
            await queryClient.invalidateQueries({
                queryKey: [GET_USER_BY_ID_QUERY_KEY + id]
            });

            showSuccess("User updated successfully!");
            setIsConfirmOpen(false);
            setPendingData(null);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error?.message ||
                                error?.response?.data?.error ||
                                error?.message ||
                                "Failed to update user";
            showError(errorMessage);
            setIsConfirmOpen(false);
        }
    };

    // Handle cancel - close modal without submitting
    const handleCancel = () => {
        setIsConfirmOpen(false);
        setPendingData(null);
    };

    if (isLoading) {
        return <div className="flex items-center gap-2">Loading... <AiOutlineLoading3Quarters className="animate-spin" /></div>;
    }

    return (
        <div className="p-8">
            {toastError && <UnexpectedError errorMessage={toastError} />}
            {toastMessage && <SuccessToast toastMessage={toastMessage}/>}
            <form onSubmit={handleSubmit(onSubmit)} className="sm:w-full lg:w-2/3">
                <UserInfoFormFields
                    register={register}
                    errors={errors}
                    avatarUrl={user?.profilePicturePath}
                    isSubmitting={updateUserMutation.isPending}
                />
            </form>

            <ConfirmModal
                isOpen={isConfirmOpen}
                modalProps={{
                    header: "Confirm Update",
                    message: "Are you sure you want to update this user's information?",
                    yes: "Yes, Update",
                    no: "Cancel",
                    disableSubmit: updateUserMutation.isPending
                }}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </div>
    );
}

export default UserPersonalInfo;