"use client"
import React from 'react';
import Link from "next/link";
import {ADMIN_MANAGEMENTS} from "@/app/Util/constants/paths";
import {z} from "zod";
import {adminAddUserSchema} from "@/app/busniessLogic/User/userValidation";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter} from "next/navigation";

type AddNewUserForm = z.infer<typeof adminAddUserSchema>;

function AddNewUser() {
    const router = useRouter();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<AddNewUserForm>({
        resolver: zodResolver(adminAddUserSchema),
    });

    return (
        <div className=" m-2 p-2 w-full">
            <div className="breadcrumbs text-sm">
                <ul>
                    <li><Link className="link-primary" href={ADMIN_MANAGEMENTS.PATH.USERS}>User Management</Link></li>
                    <li>Add New User</li>
                </ul>
            </div>
            <p className="text-xl font-semibold">Add New User</p>
            <form className="grid md:grid-cols-2 sm:grid-cols-1 w-1/2 gap-1">
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">First Name</legend>
                    <input type="text" className="input" placeholder="John" />
                    {/*<p className="label">Optional</p>*/}
                </fieldset>
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Last Name</legend>
                    <input type="text" className="input" placeholder="Doe" />
                    {/*<p className="label">Optional</p>*/}
                </fieldset>
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Email</legend>
                    <input type="email" className="input" placeholder="johndoe@exampl.com" />
                    {/*<p className="label">Optional</p>*/}
                </fieldset>
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Phone</legend>
                    <input type="email" className="input" placeholder="(123)-456-7890" />
                    {/*<p className="label">Optional</p>*/}
                </fieldset>
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Username</legend>
                    <input type="email" className="input" placeholder="john1" />
                    {/*<p className="label">Optional</p>*/}
                </fieldset>
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Password</legend>
                    <input type="email" className="input" placeholder="password" />
                    {/*<p className="label">Optional</p>*/}
                </fieldset>
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Role</legend>
                    <select defaultValue="Pick a color" className="select">
                        <option disabled={true}>Pick a color</option>
                        <option>Crimson</option>
                        <option>Amber</option>
                        <option>Velvet</option>
                    </select>
                </fieldset>
            </form>
        </div>
    );
}

export default AddNewUser;