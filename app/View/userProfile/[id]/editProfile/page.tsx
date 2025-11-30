import React from 'react';

interface EditProfilePageProps {
    params: { id: string }
}

function EditProfile({ params }: EditProfilePageProps) {
    const userId = params.id;

    return (
        <div>
            <h1>Edit Profile</h1>
            <p>User ID: {userId}</p>
        </div>
    );
}

export default EditProfile;