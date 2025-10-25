import React, {PropsWithChildren} from 'react';



function ErrorMessage({children}: PropsWithChildren) {
    if (!children) return null
    return (
        <p className="text-red-800 mb-1 label">{children}</p>
    );
}

export default ErrorMessage;