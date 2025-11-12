'use client'
import React from 'react';
import {useGetUserById} from "@/app/busniessLogic/User/userManager";
import {CiMail, CiUser, CiPhone, CiHome, CiHashtag, CiMap} from "react-icons/ci";
import {MdMeetingRoom} from "react-icons/md";
import {RiBuilding2Line} from "react-icons/ri";

interface UserProfileProps {
    id: string
}

function UserPersonalInfo({id}: UserProfileProps) {

    const { data: user, isLoading, error } = useGetUserById(id);


    return (
        <div className="p-8">
            <fieldset className="fieldset  border-base-300 rounded-box border p-4">
                <legend className="fieldset-legend"><div className="avatar">
                    <div className="w-24 rounded-full">
                        <img src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp" />
                    </div>
                </div><p className="text-xl">General info</p></legend>
                <div className="grid grid-cols-4 gap-2">
                    <div className="flex flex-col gap-1">
                        <label className="label">First Name</label>
                        <label className="input validator">
                            <CiUser size={20}/>
                            <input
                                type="text"
                                required
                                placeholder="First Name"
                                pattern="[A-Za-z][A-Za-z0-9\-]*"
                                minLength= {3}
                                maxLength= {30}
                                title="Only letters, numbers or dash"
                            />
                        </label>
                        <small className="validator-hint my-0">
                            Must be 3 to 30 characters
                        </small>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="label">Last Name</label>
                        <label className="input validator">
                            <CiUser size={20}/>
                            <input
                                type="text"
                                required
                                placeholder="Last Name"
                                pattern="[A-Za-z][A-Za-z0-9\-]*"
                                minLength= {1}
                                maxLength= {30}
                                title="Only letters, numbers or dash"
                            />
                        </label>
                        <small className="validator-hint my-0">
                            Must be 3 to 30 characters
                        </small>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="label">Email</label>
                        <label className="input validator">
                            <CiMail size={20}/>
                            <input
                                type="email"
                                required
                                placeholder="Email"
                                title="Only letters, numbers or dash"
                            />
                        </label>
                        <small className="validator-hint my-0">
                           Invalid email address
                        </small>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="label">Phone</label>
                        <label className="input validator">
                            <CiPhone size={20}/>
                            <input
                                type="text"
                                required
                                placeholder="Phone"
                                title="Only letters, numbers or dash"
                            />
                        </label>
                        <small className="validator-hint my-0">
                            Invalid phone number
                        </small>
                    </div>
                    <div className="col-span-2 flex flex-col gap-1">
                        <label className="label">Address</label>
                        <label className="input validator w-full">
                            <CiPhone size={20}/>
                            <input
                                type="text"
                                required
                                placeholder="Address"
                                title="Only letters, numbers or dash"
                            />
                        </label>
                        <small className="validator-hint my-0">
                            Invalid phone number
                        </small>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="label">Apt/Room</label>
                        <label className="input validator">
                            <CiHashtag size={20}/>
                            <input
                                type="text"
                                placeholder="Apt"
                            />
                        </label>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="label">State</label>
                        <label className="input validator">
                            <CiMap size={20}/>
                            <input
                                type="text"
                                placeholder="State"
                            />
                        </label>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="label">Zip</label>
                        <label className="input validator">
                            <CiMap size={20}/>
                            <input
                                type="text"
                                placeholder="Zip"
                            />
                        </label>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="label">Username</label>
                        <label className="input validator">
                            <CiUser size={20}/>
                            <input
                                type="text"
                                placeholder="Username"
                            />
                        </label>
                    </div>
                </div>
                <button className="btn btn-primary mt-5 w-1/2"> Save </button>
            </fieldset>

        </div>
    );
}

export default UserPersonalInfo;