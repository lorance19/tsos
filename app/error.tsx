'use client';

import { useEffect } from 'react';
import { useToast } from '@/app/Util/ToastContext';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const { showError } = useToast();

    useEffect(() => {
        // Log error to console for debugging
        console.error('Application error:', error);

        // Show error toast
        showError(error.message || 'An unexpected error occurred. Please try again.');
    }, [error, showError]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-96 bg-base-100 shadow-xl">
                <div className="card-body items-center text-center">
                    <h2 className="card-title text-error">Something went wrong!</h2>
                    <p className="text-base-content/70">
                        {error.message || 'An unexpected error occurred'}
                    </p>
                    {error.digest && (
                        <p className="text-xs text-base-content/50 mt-2">
                            Error ID: {error.digest}
                        </p>
                    )}
                    <div className="card-actions justify-center mt-4">
                        <button
                            onClick={reset}
                            className="btn btn-primary"
                        >
                            Try again
                        </button>
                        <a href="/" className="btn btn-ghost">
                            Go home
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}