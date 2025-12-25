'use client';

import { useState } from 'react';
import { useToast } from '@/app/Util/ToastContext';

export default function TestErrorPage() {
    const { showError, showSuccess } = useToast();
    const [shouldError, setShouldError] = useState(false);

    if (shouldError) {
        throw new Error('Test rendering error - Error boundary should catch this!');
    }

    const testRenderError = () => {
        setShouldError(true);
    };

    const testEventHandlerError = () => {
        throw new Error('Test event handler error - This should crash!');
    };

    const testAsyncError = async () => {
        try {
            throw new Error('Test async error');
        } catch (error) {
            showError((error as Error).message);
        }
    };

    const testManualToast = () => {
        showSuccess('This is a success toast!');
        setTimeout(() => {
            showError('This is an error toast!');
        }, 1000);
    };

    return (
        <div className="container mx-auto p-8">
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h1 className="card-title text-3xl mb-4">Error Boundary Test Page</h1>
                    <p className="mb-4">Use these buttons to test different error scenarios:</p>

                    <div className="space-y-4">
                        {/* Test 1: Rendering Error */}
                        <div className="border border-base-300 p-4 rounded-lg">
                            <h3 className="font-bold mb-2">1. Test Rendering Error (Caught by Error Boundary)</h3>
                            <p className="text-sm mb-2">Triggers an error during component rendering. Error boundary will catch this.</p>
                            <button
                                onClick={testRenderError}
                                className="btn btn-error"
                            >
                                Throw Rendering Error
                            </button>
                        </div>

                        {/* Test 2: Event Handler Error */}
                        <div className="border border-base-300 p-4 rounded-lg">
                            <h3 className="font-bold mb-2">2. Test Event Handler Error (Will crash)</h3>
                            <p className="text-sm mb-2">Errors in event handlers are NOT caught by error boundaries. App will crash.</p>
                            <button
                                onClick={testEventHandlerError}
                                className="btn btn-warning"
                            >
                                Throw Event Handler Error
                            </button>
                        </div>

                        {/* Test 3: Async Error with Toast */}
                        <div className="border border-base-300 p-4 rounded-lg">
                            <h3 className="font-bold mb-2">3. Test Async Error (Handled with Toast)</h3>
                            <p className="text-sm mb-2">Properly handled async error that shows a toast notification.</p>
                            <button
                                onClick={testAsyncError}
                                className="btn btn-info"
                            >
                                Trigger Async Error
                            </button>
                        </div>

                        {/* Test 4: Manual Toast */}
                        <div className="border border-base-300 p-4 rounded-lg">
                            <h3 className="font-bold mb-2">4. Test Toast Notifications</h3>
                            <p className="text-sm mb-2">Shows both success and error toasts.</p>
                            <button
                                onClick={testManualToast}
                                className="btn btn-success"
                            >
                                Show Toasts
                            </button>
                        </div>
                    </div>

                    <div className="alert alert-info mt-6">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span>After testing errors, you can navigate back home or use the browser back button.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}