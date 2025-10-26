import React from 'react';

function Unauthorized() {
    return (
        <div className="flex justify-center m-3 p-3 w-full h-1/6">
            <div className="card shadow-xl border border-error bg-base-100">
                <div className="card-body items-center text-center">
                    <div className="alert alert-error shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg"
                             className="stroke-current shrink-0 h-6 w-6"
                             fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold">Unauthorized Access</span>
                    </div>

                    <p className="mt-4 text-sm text-gray-500">
                        You are not authorized to access this page.
                        Please contact <span className="font-medium text-error">Admin</span> for further support.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Unauthorized;