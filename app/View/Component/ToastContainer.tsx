'use client';

import React from 'react';
import { useToast } from '@/app/Util/ToastContext';

export default function ToastContainer() {
    const { toasts, removeToast } = useToast();

    const getAlertClass = (type: 'success' | 'error' | 'info') => {
        switch (type) {
            case 'success':
                return 'alert-success';
            case 'error':
                return 'alert-error';
            case 'info':
                return 'alert-info';
            default:
                return 'alert-info';
        }
    };

    if (toasts.length === 0) return null;

    return (
        <div className="toast toast-top toast-end z-50">
            {toasts.map((toast) => (
                <div key={toast.id} className={`alert ${getAlertClass(toast.type)} shadow-lg`}>
                    <div className="flex items-start gap-2">
                        <span className="flex-1">{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="btn btn-sm btn-ghost btn-circle"
                            aria-label="Close notification"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}