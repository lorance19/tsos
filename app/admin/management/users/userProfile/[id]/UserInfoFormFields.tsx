import React from 'react';
import {CiMail, CiUser, CiPhone, CiHome, CiHashtag, CiMap, CiGlobe} from "react-icons/ci";
import {UseFormRegister, FieldErrors} from "react-hook-form";
import {editUserSchema} from "@/app/busniessLogic/User/userValidation";
import {z} from "zod";
import {COUNTRY} from "@/app/Util/constants/country";
import {AiOutlineLoading3Quarters} from "react-icons/ai";
import {IoCheckmarkCircleOutline} from "react-icons/io5";
import {FaBan} from "react-icons/fa";

type EditUserForm = z.infer<typeof editUserSchema>;

interface UserInfoFormFieldsProps {
    register: UseFormRegister<EditUserForm>;
    errors: FieldErrors<EditUserForm>;
    avatarUrl?: string;
    isSubmitting?: boolean;
    onDeactivate?: () => void;
    onActivate?: () => void;
    isActive: boolean;
}
const COUNTRIES = Object.entries(COUNTRY).map(([key, value]) => ({
    name: key,
    code: value,
}));

function UserInfoFormFields({register, errors, avatarUrl, isSubmitting = false, onDeactivate, onActivate, isActive}: UserInfoFormFieldsProps) {
    return (
        <fieldset className={`fieldset border-base-300 rounded-box border p-4 ${isActive ? "" : "border-red-600"}`}>
            <legend className="fieldset-legend">
                <div className="avatar">
                    <div className="w-24 rounded-full">
                        <img
                            src={avatarUrl || "https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"}
                            alt="User avatar"
                        />
                    </div>
                </div>
                <div className="text-xl">General info
                    {isActive && <div className="badge badge-success mx-2"><IoCheckmarkCircleOutline className="text-md"/>Active</div>}
                    {!isActive && <div className="badge badge-error mx-2"><FaBan className="text-md"/>Inactive</div>}
                </div>
            </legend>

            <div className="grid lg:grid-cols-4 md:grid-cols-4 sm:grid-cols-1 gap-2">
                <div className="flex flex-col gap-1">
                    <label className="label">First Name</label>
                    <label className={`input validator ${errors.firstName ? 'input-error' : ''}`}>
                        <CiUser size={20}/>
                        <input
                            {...register('firstName')}
                            type="text"
                            placeholder="First Name"
                        />
                    </label>
                    {errors.firstName && (
                        <small className="validator-hint visible my-0 text-error">
                            {errors.firstName.message}
                        </small>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label className="label">Last Name</label>
                    <label className={`input validator ${errors.lastName ? 'input-error' : ''}`}>
                        <CiUser size={20}/>
                        <input
                            {...register('lastName')}
                            type="text"
                            placeholder="Last Name"
                        />
                    </label>
                    {errors.lastName && (
                        <small className="validator-hint visible my-0 text-error">
                            {errors.lastName.message}
                        </small>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label className="label">Email</label>
                    <label className={`input validator ${errors.email ? 'input-error' : ''}`}>
                        <CiMail size={20}/>
                        <input
                            {...register('email')}
                            type="email"
                            placeholder="Email"
                        />
                    </label>
                    {errors.email && (
                        <small className="validator-hint visible my-0 text-error">
                            {errors.email.message}
                        </small>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label className="label">Phone</label>
                    <label className={`input validator ${errors.phone ? 'input-error' : ''}`}>
                        <CiPhone size={20}/>
                        <input
                            {...register('phone')}
                            type="text"
                            placeholder="Phone"
                        />
                    </label>
                    {errors.phone && (
                        <small className="validator-hint visible my-0 text-error">
                            {errors.phone.message}
                        </small>
                    )}
                </div>

                <div className="col-span-1 lg:col-span-2 flex flex-col gap-1">
                    <label className="label">Street Address</label>
                    <label className={`input validator lg:w-full ${errors.address?.street1 ? 'input-error' : ''}`}>
                        <CiHome size={20}/>
                        <input
                            {...register('address.street1')}
                            type="text"
                            placeholder="Street Address"
                        />
                    </label>
                    {errors.address?.street1 && (
                        <small className="validator-hint visible my-0 text-error">
                            {errors.address.street1.message}
                        </small>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label className="label">Apt/Suite</label>
                    <label className={`input validator ${errors.address?.street2 ? 'input-error' : ''}`}>
                        <CiHashtag size={20}/>
                        <input
                            {...register('address.street2')}
                            type="text"
                            placeholder="Apt/Suite (optional)"
                        />
                    </label>
                    {errors.address?.street2 && (
                        <small className="validator-hint visible my-0 text-error">
                            {errors.address.street2.message}
                        </small>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label className="label">City</label>
                    <label className={`input validator ${errors.address?.city ? 'input-error' : ''}`}>
                        <CiMap size={20}/>
                        <input
                            {...register('address.city')}
                            type="text"
                            placeholder="City"
                        />
                    </label>
                    {errors.address?.city && (
                        <small className="validator-hint visible my-0 text-error">
                            {errors.address.city.message}
                        </small>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label className="label">Zip Code</label>
                    <label className={`input validator ${errors.address?.zip ? 'input-error' : ''}`}>
                        <CiMap size={20}/>
                        <input
                            {...register('address.zip')}
                            type="text"
                            placeholder="Zip Code"
                        />
                    </label>
                    {errors.address?.zip && (
                        <small className="validator-hint visible my-0 text-error">
                            {errors.address.zip.message}
                        </small>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label className="label">Country</label>
                    <label className={`input validator ${errors.address?.country ? 'input-error' : ''}`}>
                        <CiGlobe size={20}/>
                        <select className="border-none focus:outline-none focus:ring-0 focus:border-none"
                            {...register('address.country')}>
                            <option value="">Select your country</option>
                            {COUNTRIES.map((country) => (
                                <option key={country.code} value={country.code}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    {errors.userName && (
                        <small className="validator-hint visible text-error my-0">
                            {errors.userName.message}
                        </small>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label className="label">Username</label>
                    <label className={`input validator ${errors.userName ? 'input-error' : ''}`}>
                        <CiUser size={20}/>
                        <input
                            {...register('userName')}
                            type="text"
                            placeholder="Username"
                        />
                    </label>
                    {errors.userName && (
                        <small className="validator-hint visible text-error my-0">
                            {errors.userName.message}
                        </small>
                    )}
                </div>
            </div>
            <div className="grid lg:grid-cols-4 sm:grid-cols-1 md:grid-cols-4 gap-1 my-2">
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <AiOutlineLoading3Quarters className="animate-spin" />
                            Saving update...
                        </>
                    ) : (
                        'Update'
                    )}
                </button>
                <button
                    type="button"
                    className="btn bg-red-400"
                    disabled={isSubmitting}
                >
                    Reset Password
                </button>
                <button
                    type="button"
                    className={`btn bg-purple-400 ${isActive ? "" : "hidden btn-disabled"}`}
                    disabled={isSubmitting}
                    onClick={onDeactivate}
                >
                    Deactivate
                </button>
                <button
                    type="button"
                    className={`btn bg-success ${isActive ? "hidden btn-disabled" : ""}`}
                    disabled={isSubmitting}
                    onClick={onActivate}
                >
                    Activate
                </button>
            </div>
        </fieldset>
    );
}

export default UserInfoFormFields;