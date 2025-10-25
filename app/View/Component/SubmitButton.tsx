import React from 'react';

interface SubmitButtonProps {
    isSubmitting: boolean;
    text: string,
    className?: string
}

function SubmitButton({isSubmitting, text, className = ""} : SubmitButtonProps) {
    return (
        <button type="submit" className={`btn btn-primary ${className}`} disabled={isSubmitting}>
            {text} {isSubmitting ? <span className="loading loading-spinner loading-xs"></span> : ""}
        </button>
    );
}

export default SubmitButton;