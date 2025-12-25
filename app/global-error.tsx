'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log critical error
        console.error('Critical application error:', error);
    }, [error]);

    return (
        <html lang="en" data-theme="bumblebee">
            <body>
                <div className="min-h-screen flex items-center justify-center bg-base-200">
                    <div className="card w-96 bg-base-100 shadow-xl">
                        <div className="card-body items-center text-center">
                            <h2 className="card-title text-error">Critical Error</h2>
                            <p className="text-base-content/70">
                                A critical error has occurred. Please refresh the page or contact support.
                            </p>
                            <p className="text-sm text-error mt-2">
                                {error.message}
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
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="btn btn-ghost"
                                >
                                    Go home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}