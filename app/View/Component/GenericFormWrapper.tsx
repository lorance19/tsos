'use client';

import React, { useState } from 'react';
import { DefaultValues, FieldValues, useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {z} from "zod";
import SubmitButton from "@/app/View/Component/SubmitButton";
import SuccessToast from "@/app/View/Component/SuccessToast";
import ConfirmModal from "@/app/View/Component/ConfirmModal";
import UnexpectedError from "@/app/View/Component/UnexpectedError";

type GenericFormWrapperProps<T extends FieldValues> = {
    schema: z.ZodType<T, any, any>;
    onSubmit: (data: T) => Promise<void>;
    children: (params: {
        register: ReturnType<typeof useForm<T>>['register'];
        errors: ReturnType<typeof useForm<T>>['formState']['errors'];
        control?: ReturnType<typeof useForm<T>>['control'];
    }) => React.ReactNode;
    confirmModalProps?: {
        title?: string;
        message?: string;
        confirmText?: string;
        cancelText?: string;
        disableSubmit?: boolean;
        submitButtonClass?: string;
    };
    formMethods?: UseFormReturn<T>;
    defaultValues?: Partial<T>;
    successMessage?: string;
    errorMessage?: string;
};

// Custom hook for notification management
function useNotifications() {
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');

    const showError = (message: string, duration = 3000) => {
        setError(message);
        setTimeout(() => setError(''), duration);
    };

    const showSuccess = (message: string, duration = 3000) => {
        setToast(message);
        setTimeout(() => setToast(''), duration);
    };

    const clearNotifications = () => {
        setError('');
        setToast('');
    };

    return {
        error,
        toast,
        showError,
        showSuccess,
        clearNotifications,
    };
}

function GenericFormWrapper<T extends FieldValues>({
                                                       schema,
                                                       onSubmit,
                                                       children,
                                                       confirmModalProps = {},
                                                       formMethods,
                                                       defaultValues,
                                                       successMessage = "Action completed successfully!",
                                                       errorMessage = "Unexpected error occurred."
                                                   }: GenericFormWrapperProps<T>) {

    // Use external form methods if provided, otherwise create internal form
    const internalForm = useForm<T>({
        resolver: zodResolver(schema) as any,
        defaultValues: defaultValues as DefaultValues<T>,
    });

    const form = formMethods || internalForm;
    const { register, handleSubmit, formState: { errors }, getValues, control } = form;

    const {
        title = "Confirmation",
        message = "Are you sure?",
        confirmText = "Submit",
        cancelText = "Cancel",
        disableSubmit = false,
        submitButtonClass = "w-full mt-2"
    } = confirmModalProps;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const { error, toast, showError, showSuccess, clearNotifications } = useNotifications();

    const handleFormSubmit = () => {
        clearNotifications();
        setIsConfirmOpen(true);
    };

    const handleConfirm = async () => {
        setIsConfirmOpen(false);
        setIsSubmitting(true);

        try {
            await onSubmit(getValues());
            showSuccess(successMessage);
        } catch (err) {
            console.error('Form submission error:', err);

            // Extract meaningful error message
            let displayError = errorMessage;
            if (err instanceof Error) {
                displayError = err.message;
            } else if (typeof err === 'string') {
                displayError = err;
            }

            showError(displayError);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setIsConfirmOpen(false);
        clearNotifications();
    };

    return (
        <>
            <UnexpectedError errorMessage={error} />
            {toast && <SuccessToast toastMessage={toast} />}

            <form onSubmit={handleSubmit(handleFormSubmit)}>
                {children({ register, errors, control })}
                <SubmitButton
                    isSubmitting={isSubmitting}
                    text={confirmText}
                    className={`${submitButtonClass} mt-2`}
                />
            </form>

            <ConfirmModal
                isOpen={isConfirmOpen}
                modalProps={{
                    header: title,
                    message: message,
                    yes: confirmText,
                    no: cancelText,
                    disableSubmit: isSubmitting || disableSubmit
                }}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </>
    );
}

export default GenericFormWrapper;