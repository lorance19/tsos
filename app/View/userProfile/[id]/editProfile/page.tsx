'use client'
import React, {useEffect, useState} from 'react';
import Link from "next/link";
import { useParams } from "next/navigation";
import { USER_PROFILE } from "@/app/Util/constants/paths";
import { useAuth } from "@/app/auth/context";
import Unauthorized from "@/app/View/unauthorized/page";
import {
    GET_USER_BY_ID_QUERY_KEY,
    useGetUserById,
    useAdminUpdateUser,
    useUpdateUser
} from "@/app/busniessLogic/User/userManager";
import {z} from "zod";
import { userEditUserSchema} from "@/app/busniessLogic/User/userValidation";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {COUNTRY} from "@/app/Util/constants/country";
import {CiGlobe, CiHashtag, CiHome, CiMail, CiMap, CiPhone, CiUser} from "react-icons/ci";
import {useToastNotifications} from "@/app/Util/toast";
import UnexpectedError from "@/app/View/Component/UnexpectedError";
import SuccessToast from "@/app/View/Component/SuccessToast";
import ConfirmModal from "@/app/View/Component/ConfirmModal";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import axios from "axios";

type editUserForm = z.infer<typeof userEditUserSchema>;
const COUNTRIES = Object.entries(COUNTRY).map(([key, value]) => ({
    name: key,
    code: value,
}));

function EditProfileClient() {
    const params = useParams();
    const userId = params.id as string;
    const queryClient = useQueryClient();
    // ALL HOOKS MUST BE CALLED FIRST (before any conditional returns)
    const { user } = useAuth();
    const { data: customer, isLoading, error } = useGetUserById(userId);
    const {register, handleSubmit, formState: { errors }, reset} = useForm<editUserForm>({
        resolver: zodResolver(userEditUserSchema)
    });

    const { error: toastError, toastMessage, showError, showSuccess } = useToastNotifications();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingData, setPendingData] = useState<editUserForm | null>(null);

    // Mutation for updating user profile
    const updateProfileMutation = useUpdateUser(user!.userId);

    // Update form values when user data loads
    useEffect(() => {
        if (customer) {
            reset({
                firstName: customer.firstName || '',
                lastName: customer.lastName || '',
                phone: customer.phone || '',
                email: customer.email || '',
                address: {
                    street1: customer.address?.street1 || '',
                    street2: customer.address?.street2 || '',
                    city: customer.address?.city || '',
                    zip: customer.address?.zip || '',
                    country: (customer.address?.country as COUNTRY) || undefined
                }
            });
        }
    }, [customer, reset]);

    if (user?.userId !== userId) {
        return <Unauthorized />;
    }

    if (isLoading) {
        return <p>Loading Profile ... </p>
    }

    // Show confirmation modal when form is submitted
    const onSubmit = (data: editUserForm) => {
        setPendingData(data);
        setIsConfirmOpen(true);
    };

    // Handle confirmation - perform the mutation
    const handleConfirm = async () => {
        try {
            if (!pendingData) return;

            await updateProfileMutation.mutateAsync(pendingData);

            // Invalidate and refetch user data
            await queryClient.invalidateQueries({
                queryKey: [GET_USER_BY_ID_QUERY_KEY + userId]
            });

            showSuccess("Profile updated successfully!");
            setIsConfirmOpen(false);
            setPendingData(null);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error?.message ||
                                error?.response?.data?.error ||
                                error?.message ||
                                "Failed to update profile";
            showError(errorMessage);
            setIsConfirmOpen(false);
        }
    };

    // Handle cancel - close modal without submitting
    const handleCancel = () => {
        setIsConfirmOpen(false);
        setPendingData(null);
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            {toastError && <UnexpectedError errorMessage={toastError} />}
            {toastMessage && <SuccessToast toastMessage={toastMessage}/>}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl text-primary">
                        Edit Profile
                    </h2>
                    <div className="breadcrumbs text-sm">
                        <ul>
                            <li>
                                <Link className="text-primary underline" href={USER_PROFILE(userId).VIEW}>
                                    Profile
                                </Link>
                            </li>
                            <li>Edit</li>
                        </ul>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Personal Information Section */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* First Name */}
                                <div className="form-control">
                                    <label className={`input validator ${errors.firstName ? 'input-error' : ''}`}>
                                        <CiUser size={20}/>
                                        <input
                                            {...register('firstName')}
                                            type="text"
                                            placeholder="First Name"
                                        />
                                        {errors.firstName && (
                                            <small className="validator-hint visible my-0 text-error">
                                                {errors.firstName.message}
                                            </small>
                                        )}
                                    </label>
                                </div>

                                {/* Last Name */}
                                <div className="form-control">
                                    <label className={`input validator ${errors.lastName ? 'input-error' : ''}`}>
                                        <CiUser size={20}/>
                                        <input
                                            {...register('lastName')}
                                            type="text"
                                            placeholder="Last Name"
                                        />
                                        {errors.lastName && (
                                            <small className="validator-hint visible my-0 text-error">
                                                {errors.lastName.message}
                                            </small>
                                        )}
                                    </label>
                                </div>

                                {/* Email */}
                                <div className="form-control">
                                    <label className={`input validator ${errors.email ? 'input-error' : ''}`}>
                                        <CiMail size={20}/>
                                        <input
                                            {...register('email')}
                                            type="email"
                                            placeholder="Email"
                                        />
                                        {errors.email && (
                                            <small className="validator-hint visible my-0 text-error">
                                                {errors.email.message}
                                            </small>
                                        )}
                                    </label>
                                </div>

                                {/* Phone */}
                                <div className="form-control">
                                    <label className={`input validator ${errors.phone ? 'input-error' : ''}`}>
                                        <CiPhone size={20}/>
                                        <input
                                            {...register('phone')}
                                            type="text"
                                            placeholder="Phone"
                                        />
                                        {errors.phone && (
                                            <small className="validator-hint visible my-0 text-error">
                                                {errors.phone.message}
                                            </small>
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Address Section */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Address Information</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {/* Street 1 */}
                                <div className="form-control col-span-2">
                                    <label className={`input validator lg:w-full ${errors.address?.street1 ? 'input-error' : ''}`}>
                                        <CiHome size={20}/>
                                        <input
                                            {...register('address.street1')}
                                            type="text"
                                            placeholder="Street Address"
                                        />
                                        {errors.address?.street1 && (
                                            <small className="validator-hint visible my-0 text-error">
                                                {errors.address.street1.message}
                                            </small>
                                        )}
                                    </label>
                                </div>

                                {/* Street 2 */}
                                <div className="form-control">
                                    <label className={`input validator ${errors.address?.street2 ? 'input-error' : ''}`}>
                                        <CiHashtag size={20}/>
                                        <input
                                            {...register('address.street2')}
                                            type="text"
                                            placeholder="Apt/Suite (optional)"
                                        />

                                        {errors.address?.street2 && (
                                            <small className="validator-hint visible my-0 text-error">
                                                {errors.address.street2.message}
                                            </small>
                                        )}
                                    </label>
                                </div>


                                {/* City */}
                                <div className="form-control">
                                    <label className={`input validator ${errors.address?.city ? 'input-error' : ''}`}>
                                        <CiMap size={20}/>
                                        <input
                                            {...register('address.city')}
                                            type="text"
                                            placeholder="City"
                                        />
                                        {errors.address?.city && (
                                            <small className="validator-hint visible my-0 text-error">
                                                {errors.address.city.message}
                                            </small>
                                        )}
                                    </label>
                                </div>

                                {/* Zip */}
                                <div className="form-control">
                                    <label className={`input validator ${errors.address?.zip ? 'input-error' : ''}`}>
                                        <CiMap size={20}/>
                                        <input
                                            {...register('address.zip')}
                                            type="text"
                                            placeholder="Zip Code"
                                        />
                                        {errors.address?.zip && (
                                            <small className="validator-hint visible my-0 text-error">
                                                {errors.address.zip.message}
                                            </small>
                                        )}
                                    </label>
                                </div>

                                {/* Country */}
                                <div className="form-control">
                                    <label className={`input validator ${errors.address?.country ? 'input-error' : ''}`}>
                                        <CiGlobe size={20}/>
                                        <select className="select h-2 !border-none !outline-none focus:!border-none focus:!outline-none active:!border-none active:!outline-none"
                                                {...register('address.country')}>
                                            <option value="">Country</option>
                                            {COUNTRIES.map((country) => (
                                                <option key={country.code} value={country.code}>
                                                    {country.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.address?.country && (
                                            <small className="validator-hint visible text-error my-0">
                                                {errors.address?.country.message}
                                            </small>
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end gap-4 pt-4">
                            <Link href={USER_PROFILE(userId).VIEW} className="btn btn-ghost">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={updateProfileMutation.isPending}
                            >
                                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <ConfirmModal
                isOpen={isConfirmOpen}
                modalProps={{
                    header: "Confirm Update",
                    message: "Are you sure you want to update your profile information?",
                    yes: "Yes, Update",
                    no: "Cancel",
                    disableSubmit: updateProfileMutation.isPending
                }}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </div>
    );
}

export default EditProfileClient;