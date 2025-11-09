'use client'
import React, {useState} from 'react';
import {useRouter} from "next/navigation";
import {createUserSchema} from "@/app/busniessLogic/User/userValidation";
import {z} from "zod";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import UnexpectedError from "@/app/View/Component/UnexpectedError";
import ErrorMessage from '../Component/ErrorMessage';
import {MdOutlineMailOutline} from "react-icons/md";
import {GrKey} from "react-icons/gr";
import {IoBagCheck} from "react-icons/io5";
import SubmitButton from "@/app/View/Component/SubmitButton";
import {useSignUpUser} from "@/app/busniessLogic/User/userManager";
import SuccessToast from "@/app/View/Component/SuccessToast";
import {FaRegUser} from "react-icons/fa";

type UserForm = z.infer<typeof createUserSchema>;

function SignUp() {
    const DELAY = 2000;
    const router = useRouter();

    const { error, toastMessage, showError, showSuccess } = useToastNotifications();
    const createUser = useSignUpUser();
    const isPending = createUser.isPending;
    const { register, handleSubmit, reset, formState: { errors } } = useForm<UserForm>({
        resolver: zodResolver(createUserSchema),
    });

    const onSubmit: SubmitHandler<UserForm> = (data) => {
        createUser.mutate(data, {
            onSuccess: () => {
                showSuccess('Registration successful!');
                reset(); // Clear form on success
                setTimeout(() => {
                    router.push("/")
                    router.refresh();
                }, DELAY);
            },
            onError: (error) => {
                const errorMessage = extractValidationError(error);
                showError(errorMessage);
            },
        });
    };

    return (
        <div>
            <UnexpectedError errorMessage={error} />
            {toastMessage && <SuccessToast toastMessage ={toastMessage}/>}
            <form className="mt-5 flex justify-center " onSubmit={handleSubmit(onSubmit)}>
                <fieldset disabled={isPending}>
                    <label className="input input-bordered basis-lg m-2">
                        <span className="opacity-70"><FaRegUser/></span>
                        <input type="text" placeholder="Username" {...register('userName')} />
                    </label>
                    <ErrorMessage>{errors.userName?.message}</ErrorMessage>
                    <label className="input input-bordered basis-lg m-2">
                        <span className="opacity-70"><MdOutlineMailOutline/></span>
                        <input type="email" placeholder="Email" {...register('email')} />
                    </label>
                    <ErrorMessage>{errors.email?.message}</ErrorMessage>
                    <label className="input input-bordered flex gap-5 m-2">
                        <span className="opacity-70"><GrKey/></span>
                        <input type="password" placeholder="Password" {...register('password')} />
                    </label>
                    <ErrorMessage>{errors.password?.message}</ErrorMessage>
                    <label className="input input-bordered flex gap-5 m-2">
                        <span className="opacity-70"><IoBagCheck/></span>
                        <input type="password" placeholder="Confirm Password" {...register('confirmPassword')} />
                    </label>
                    <ErrorMessage>{errors.confirmPassword?.message}</ErrorMessage>
                    <SubmitButton className="m-2" isSubmitting={createUser.isPending} text="Register"/>
            </fieldset>
            </form>
        </div>
    );
}


function useToastNotifications() {
    const [error, setError] = useState('');
    const [toastMessage, setToastMessage] = useState('');

    const showError = (message: string, duration = 3000) => {
        setError(message);
        setTimeout(() => setError(''), duration);
    };

    const showSuccess = (message: string, duration = 3000) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), duration);
    };

    const clearMessages = () => {
        setError('');
        setToastMessage('');
    };

    return { error, toastMessage, showError, showSuccess, clearMessages };
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

export default SignUp;