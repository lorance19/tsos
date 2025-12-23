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

function ContactUs() {
    const { error, toastMessage, showError, showSuccess } = useToastNotifications();
    const createIssueMutation = useCreateIssue();
    const isPending = createIssueMutation.isPending;

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateIssueFormData>({
        resolver: zodResolver(createIssueSchema),
    });

    const onSubmit: SubmitHandler<CreateIssueFormData> = (data) => {
        createIssueMutation.mutate(data, {
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
        <div className="min-h-screen py-10">
            <UnexpectedError errorMessage={error} />
            {toastMessage && <SuccessToast toastMessage={toastMessage}/>}

            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto px-5">
                {/* Left side - Information */}
                <div className="flex justify-center items-center">
                    <div className="flex-col justify-start space-y-6">
                        <h1 className="text-4xl md:text-5xl font-bold text-secondary">Contact Us</h1>
                        <p className="text-gray-600 text-lg md:text-xl">
                            We are committed to processing your information in order to contact you and discuss your needs.
                        </p>
                        <div className="space-y-4 text-gray-700">
                            <div>
                                <h3 className="font-semibold text-lg">Get in Touch</h3>
                                <p className="text-base">Have questions or need support? Fill out the form and we'll respond as soon as possible.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Contact Form */}
                <div className="flex justify-center items-center">
                    <div className="w-full max-w-md">
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title text-2xl font-bold text-secondary mb-4">Send us a message</h2>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <fieldset disabled={isPending}>
                                        {/* Subject Field */}
                                        <div>
                                            <label className="input input-bordered flex items-center gap-2">
                                                <MdOutlineSubject className="opacity-70" />
                                                <input
                                                    type="text"
                                                    placeholder="Subject"
                                                    {...register('title')}
                                                    className="grow"
                                                />
                                            </label>
                                            <ErrorMessage>{errors.title?.message}</ErrorMessage>
                                        </div>

                                        {/* Message Field */}
                                        <div>
                                            <label className="form-control">
                                                <div className="label">
                                                    <span className="label-text flex items-center gap-2">
                                                        <MdOutlineMessage className="opacity-70" />
                                                        Message
                                                    </span>
                                                </div>
                                                <textarea
                                                    className="textarea textarea-bordered h-32"
                                                    placeholder="Tell us about your inquiry..."
                                                    {...register('description')}
                                                ></textarea>
                                            </label>
                                            <ErrorMessage>{errors.description?.message}</ErrorMessage>
                                        </div>

                                        {/* Submit Button */}
                                        <SubmitButton
                                            className="w-full"
                                            isSubmitting={isPending}
                                            text="Send Message"
                                        />
                                    </fieldset>
                                </form>
                            </div>
                        </div>
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
            validationErrors.title?.errors?.[0],
            validationErrors.description?.errors?.[0],
        ].filter(Boolean);

        if (fieldErrors.length > 0) {
            return fieldErrors[0];
        }
    }

    return 'Sorry! An unexpected error occurred. Please try again.';
}

export default ContactUs;