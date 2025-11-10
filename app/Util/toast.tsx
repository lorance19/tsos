import {useState} from "react";

export function useToastNotifications() {
    const [error, setError] = useState('');
    const [toastMessage, setToastMessage] = useState('');

    const showError = (message: string, duration = 3000) => {
        setError(message);
        setTimeout(() => setError(''), duration);
    };

    const showSuccess = (message: string, duration = 3000) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), duration);
    };

    const clearMessages = () => {
        setError('');
        setToastMessage('');
    };

    return { error, toastMessage, showError, showSuccess, clearMessages };
}