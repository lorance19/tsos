import React, {useTransition} from 'react';
import {signOut} from "@/app/auth/logout";

function SignOutButton() {
    const [isPending, startTransition] = useTransition();

    const handleSignOut =  () => {
        startTransition(async () => {
            await signOut();
        })
    };

    return (
        <button className="text-red-400 hover:text-red-500" onClick={handleSignOut}>Logout</button>
    );
}

export default SignOutButton;