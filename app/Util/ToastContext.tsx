'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showSuccess: (message: string, duration?: number) => void;
    toasts: Toast[];
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
        const id = Math.random().toString(36).substring(7);
        const toast: Toast = { id, message, type };

        setToasts((prev) => [...prev, toast]);

        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }
    }, [removeToast]);

    const showError = useCallback((message: string, duration = 5000) => {
        showToast(message, 'error', duration);
    }, [showToast]);

    const showSuccess = useCallback((message: string, duration = 3000) => {
        showToast(message, 'success', duration);
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, showError, showSuccess, toasts, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}