import React from "react";
import {AxiosError} from "axios";

function Unexpected({axiosError} : {axiosError: AxiosError} ) {
    const {response } = axiosError;
    const { error } = response?.data as { error: string };

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
                        <span className="font-semibold">Oops, Sorry, Something went wrong.</span>
                    </div>

                    <p className="mt-4 text-sm text-gray-500">
                        We are looking at it now.
                        Please contact <span className="font-medium text-error">Admin</span> for further support.
                    </p>
                    {process.env.NEXT_PUBLIC_ENVIRONMENT === "development" && <div>
                        {response &&
                            <div>
                                <p className=" text-xl text-red-600">HTTP Status: {response.status}</p>
                                <p className=" text-xl text-red-600">Error: {error}</p>
                            </div>}
                    </div>}
                </div>
            </div>
        </div>
    );
}
export default Unexpected;