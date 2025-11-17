"use client"
import React from 'react';
import Link from "next/link";
import {ADMIN_MANAGEMENTS} from "@/app/Util/constants/paths";
import {z} from "zod";
import {adminAddUserSchema} from "@/app/busniessLogic/User/userValidation";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter} from "next/navigation";
import SubmitButton from "@/app/View/Component/SubmitButton";
import UnexpectedError from "@/app/View/Component/UnexpectedError";
import {useToastNotifications} from "@/app/Util/toast";
import ErrorMessage from "@/app/View/Component/ErrorMessage";
import {GET_ALL_USERS_QUERY_KEY, useCreateUser, useSignUpUser} from "@/app/busniessLogic/User/userManager";
import SuccessToast from "@/app/View/Component/SuccessToast";
import {Role} from "@prisma/client";
import _ from "lodash";
import {useQueryClient} from "@tanstack/react-query";

type AddNewUserForm = z.infer<typeof adminAddUserSchema>;

function AddNewUser() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const DELAY = 2000;
    const { register, handleSubmit, reset, formState: { errors } } = useForm<AddNewUserForm>({
        resolver: zodResolver(adminAddUserSchema),
    });
    const createUser = useCreateUser();
    const isPending = createUser.isPending;
    const { error, toastMessage, showError, showSuccess } = useToastNotifications();

    const onSubmit: SubmitHandler<AddNewUserForm> =  (data: AddNewUserForm) => {
        createUser.mutate(data, {
            onSuccess: () => {
                showSuccess('Registration successful!');
                reset(); // Clear form on success
                queryClient.invalidateQueries({queryKey: [GET_ALL_USERS_QUERY_KEY]})
                    .then(r => setTimeout(() => {
                        router.refresh();
                    }, DELAY));
            },
            onError: (error) => {
                const errorMessage = extractValidationError(error);
                showError(errorMessage);
            },
        })
    }

    return (
        <div className=" m-2 p-2 lg:w-1/2 sm:w-full xs:w-full">
            <UnexpectedError errorMessage={error} />
            {toastMessage && <SuccessToast toastMessage ={toastMessage}/>}
            <div className="breadcrumbs text-sm">
                <ul>
                    <li><Link className="link-primary" href={ADMIN_MANAGEMENTS.USERS.VIEW}>User Management</Link></li>
                    <li>Add New User</li>
                </ul>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
                    <p className="text-xl font-semibold">Add New User</p>
                    <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-1">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">First Name</legend>
                        <input type="text" className="input" placeholder="John" {...register('firstName')}/>
                        <ErrorMessage>{errors.firstName?.message}</ErrorMessage>
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Last Name</legend>
                        <input type="text" className="input" placeholder="Doe" {...register('lastName')}/>
                        <ErrorMessage>{errors.lastName?.message}</ErrorMessage>
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Email</legend>
                        <input type="email" className="input" placeholder="johndoe@exampl.com" {...register('email')}/>
                        <ErrorMessage>{errors.email?.message}</ErrorMessage>
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Phone</legend>
                        <input type="text" className="input" placeholder="(123)-456-7890" {...register('phone')} />
                        <ErrorMessage>{errors.phone?.message}</ErrorMessage>
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Username</legend>
                        <input type="text" className="input" placeholder="john1" {...register('userName')}/>
                        <ErrorMessage>{errors.userName?.message}</ErrorMessage>
                        {/*<p className="label">Optional</p>*/}
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Password</legend>
                        <input type="text" className="input" placeholder="password" {...register('password')}/>
                        <ErrorMessage>{errors.password?.message}</ErrorMessage>
                        {/*<p className="label">Optional</p>*/}
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Role</legend>
                        <select defaultValue={Role.CUSTOMER} className="select" {...register('role')} >
                            {_.reject(Object.values(Role), role => role === Role.ROOT)
                                .map((role) => (
                                    <option key={role} value={role}>
                                        {_.capitalize(role.toLowerCase())}
                                    </option>
                                ))
                            }
                        </select>
                        <ErrorMessage>{errors.role?.message}</ErrorMessage>
                    </fieldset>
                    <div></div>
                    <SubmitButton className="my-5" isSubmitting={isPending} text={"Create New User"}/>
                </div>

                </fieldset>
            </form>
        </div>
    );
}


// Extract validation error handling logic
function extractValidationError(error: any): string {
    if (error?.response?.data) {
        const validationErrors = error.response.data.properties;

        // Check for specific field errors in priority order
        const fieldErrors = [
            validationErrors.email?.errors?.[0],
            validationErrors.userName?.errors?.[0],
        ].filter(Boolean);

        if (fieldErrors.length > 0) {
            return fieldErrors[0];
        }
    }

    return 'Sorry! An unexpected error occurred.';
}

export default AddNewUser;