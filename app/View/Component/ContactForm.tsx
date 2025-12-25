'use client'
import React from 'react';
import {createIssueSchema, CreateIssueFormData} from "@/app/busniessLogic/Issue/issueValidation";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useCreateIssue} from "@/app/busniessLogic/Issue/issueManager";
import {useToastNotifications} from "@/app/Util/toast";
import UnexpectedError from "@/app/View/Component/UnexpectedError";
import SuccessToast from "@/app/View/Component/SuccessToast";
import ErrorMessage from "@/app/View/Component/ErrorMessage";
import SubmitButton from "@/app/View/Component/SubmitButton";
import {MdOutlineSubject, MdOutlineMessage} from "react-icons/md";
import {IoMailSharp} from "react-icons/io5";
import {FaUser} from "react-icons/fa";
import {useAuth} from "@/app/auth/context";

function ContactForm() {
    const { error, toastMessage, showError, showSuccess } = useToastNotifications();
    const createIssueMutation = useCreateIssue();
    const isPending = createIssueMutation.isPending;
    const { user } = useAuth();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateIssueFormData>({
        resolver: zodResolver(createIssueSchema),
    });

    const onSubmit: SubmitHandler<CreateIssueFormData> = (data) => {
        // Add role if user is logged in
        const formData = {
            ...data,
            role: user ? user.role : undefined,
        };

        createIssueMutation.mutate(formData, {
            onSuccess: () => {
                showSuccess('Your message has been sent successfully! We will get back to you soon.');
                reset();
            },
            onError: (error) => {
                const errorMessage = extractValidationError(error);
                showError(errorMessage);
            },
        });
    };

    return (
        <div className="flex justify-center items-center">
            <UnexpectedError errorMessage={error} />
            {toastMessage && <SuccessToast toastMessage={toastMessage}/>}

            <div className="w-full max-w-md">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-2xl font-bold text-secondary mb-4">Send us a message</h2>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <fieldset disabled={isPending}>
                                {/* Name Field */}
                                <div className="p-2">
                                    <label className={`input input-bordered validator ${errors.name ? 'input-error': ''} flex items-center gap-2 w-full`}>
                                        <FaUser className="opacity-70" />
                                        <input
                                            type="text"
                                            placeholder="Your Name"
                                            {...register('name')}
                                            className="grow"
                                        />
                                    </label>
                                    {errors.name && (
                                        <small className="validator-hint visible my-0 text-error">
                                            {errors.name.message}
                                        </small>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div className="p-2">
                                    <label className={`input input-bordered validator ${errors.email ? 'input-error': ''} flex items-center gap-2 w-full`}>
                                        <IoMailSharp className="opacity-70" />
                                        <input
                                            type="email"
                                            placeholder="Your Email"
                                            {...register('email')}
                                            className="grow"
                                        />
                                    </label>
                                    {errors.email && (
                                    <small className="validator-hint visible my-0 text-error">
                                        {errors.email.message}
                                    </small>
                                    )}
                                </div>

                                {/* Subject Field */}
                                <div className="p-2">
                                    <label className={`input validator input-bordered ${errors.title ? 'input-error': ''} flex items-center gap-2 w-full`}>
                                        <MdOutlineSubject className="opacity-70" />
                                        <input
                                            type="text"
                                            placeholder="Subject"
                                            {...register('title')}
                                            className="grow"
                                        />
                                    </label>
                                    {errors.title && (
                                        <small className="validator-hint visible my-0 text-error">
                                            {errors.title.message}
                                        </small>
                                    )}
                                </div>

                                {/* Message Field */}
                                <div className="p-2">
                                    <label className={`form-control validator`}>
                                        <div className="label">
                                            <span className="label-text flex items-center gap-2">
                                                <MdOutlineMessage className="opacity-70" />
                                                Message
                                            </span>
                                        </div>
                                        <textarea
                                            className={`textarea textarea-bordered h-32 ${errors.description ? 'input-error': ''} w-full`}
                                            placeholder="Tell us about your inquiry..."
                                            {...register('description')}
                                        ></textarea>
                                    </label>
                                    {errors.description && (
                                        <small className="validator-hint visible my-0 text-error">
                                            {errors.description.message}
                                        </small>
                                    )}

                                </div>

                                {/* Submit Button */}
                                <SubmitButton
                                    className="w-full m-2"
                                    isSubmitting={isPending}
                                    text="Send Message"
                                />
                            </fieldset>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Extract validation error handling logic
function extractValidationError(error: any): string {
    if (error?.response?.data) {
        const validationErrors = error.response.data.properties;

        // Check for specific field errors
        const fieldErrors = [
            validationErrors.name?.errors?.[0],
            validationErrors.email?.errors?.[0],
            validationErrors.title?.errors?.[0],
            validationErrors.description?.errors?.[0],
        ].filter(Boolean);

        if (fieldErrors.length > 0) {
            return fieldErrors[0];
        }
    }

    return 'Sorry! An unexpected error occurred. Please try again.';
}

export default ContactForm;