import React from 'react';
import {BsCheckCircleFill} from "react-icons/bs";

interface Toast {
    toastMessage: string;
}
function SuccessToast({toastMessage} :Toast) {

    return (
        <>
            {toastMessage && <div className="toast toast-top toast-center z-50">
                <div className="alert alert-success">
                    <span><BsCheckCircleFill />{toastMessage}</span>
                </div>
            </div>}
        </>
    );
}

export default SuccessToast;