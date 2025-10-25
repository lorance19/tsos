import {MdOutlineError} from "react-icons/md";

interface UnexpectedErrorProps {
    errorMessage: string;
}
//TODO: This can be combine with Success Toast
function UnexpectedError({ errorMessage }: UnexpectedErrorProps) {
    if (!errorMessage) return null;

    return (
        <div className="toast toast-top toast-center z-50">
            <div className="alert alert-error">
                <MdOutlineError /> {errorMessage}
            </div>
        </div>
    );
}

export default UnexpectedError;