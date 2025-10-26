import React, {PropsWithChildren} from 'react';



function ErrorMessage({children}: PropsWithChildren) {
    if (!children) return null
    return (
        <p className="text-red-800 mx-2 text-sm">{children}</p>
    );
}

export default ErrorMessage;