import React from 'react';
import {UseFormRegister, FieldErrors} from 'react-hook-form';
import {CiGlobe, CiHashtag, CiHome, CiMail, CiMap, CiPhone, CiUser} from 'react-icons/ci';
import {COUNTRIES} from '@/app/Util/constants/country';
import {z} from 'zod';
import {orderValidation} from '@/app/busniessLogic/Order/orderValidation';

type ShippingForm = z.infer<typeof orderValidation>;

interface ShippingInformationProps {
    register: UseFormRegister<ShippingForm>;
    errors: FieldErrors<ShippingForm>;
}

export function ShippingInformation({register, errors}: ShippingInformationProps) {
    return (
        <div className="w-full">
            <p className="text-2xl font-montserrat">Shipping Information</p>
            <div className="py-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                <div className="form-control">
                    <label className={`input validator w-full ${errors.personalInfo?.name ? 'input-error' : ''}`}>
                        <CiUser size={20}/>
                        <input
                            {...register('personalInfo.name')}
                            type="text"
                            placeholder="Name"
                        />
                        {errors.personalInfo?.name && (
                            <small className="validator-hint visible my-0 text-error">
                                {errors.personalInfo.name.message}
                            </small>
                        )}
                    </label>
                </div>
                <div className="form-control">
                    <label className={`input validator w-full ${errors.personalInfo?.email ? 'input-error' : ''}`}>
                        <CiMail size={20}/>
                        <input
                            {...register('personalInfo.email')}
                            type="email"
                            placeholder="Email"
                        />
                        {errors.personalInfo?.email && (
                            <small className="validator-hint visible my-0 text-error">
                                {errors.personalInfo.email.message}
                            </small>
                        )}
                    </label>
                </div>
                <div className="form-control">
                    <label className={`input validator w-full ${errors.personalInfo?.phone ? 'input-error' : ''}`}>
                        <CiPhone size={20}/>
                        <input
                            {...register('personalInfo.phone')}
                            type="text"
                            placeholder="Phone"
                        />
                        {errors.personalInfo?.phone && (
                            <small className="validator-hint visible my-0 text-error">
                                {errors.personalInfo.phone.message}
                            </small>
                        )}
                    </label>
                </div>

                <div className="form-control col-span-1 lg:col-span-2 md:col-span-2">
                    <label
                        className={`input validator w-full ${errors.address?.street1 ? 'input-error' : ''}`}>
                        <CiHome size={20}/>
                        <input
                            {...register('address.street1')}
                            type="text"
                            placeholder="Street"
                        />
                        {errors.address?.street1 && (
                            <small className="validator-hint visible my-0 text-error">
                                {errors.address.street1.message}
                            </small>
                        )}
                    </label>
                </div>
                <div className="form-control">
                    <label className={`input validator w-full ${errors.address?.street2 ? 'input-error' : ''}`}>
                        <CiHashtag size={20}/>
                        <input
                            {...register('address.street2')}
                            type="text"
                            placeholder="Apt/Suit (Optional)"
                        />
                        {errors.address?.street2 && (
                            <small className="validator-hint visible my-0 text-error">
                                {errors.address.street2.message}
                            </small>
                        )}
                    </label>
                </div>
                <div className="form-control">
                    <label className={`input validator w-full ${errors.address?.city ? 'input-error' : ''}`}>
                        <CiMap size={20}/>
                        <input
                            {...register('address.city')}
                            type="text"
                            placeholder="City"
                        />
                        {errors.address?.city && (
                            <small className="validator-hint visible my-0 text-error">
                                {errors.address.city.message}
                            </small>
                        )}
                    </label>
                </div>
                <div className="form-control">
                    <label className={`input w-full validator ${errors.address?.zip ? 'input-error' : ''}`}>
                        <CiMap size={20}/>
                        <input
                            {...register('address.zip')}
                            type="text"
                            placeholder="Zip"
                        />
                        {errors.address?.zip && (
                            <small className="validator-hint visible my-0 text-error">
                                {errors.address.zip.message}
                            </small>
                        )}
                    </label>
                </div>
                <div className="form-control">
                    <label className={`input validator w-full ${errors.address?.country ? 'input-error' : ''}`}>
                        <CiGlobe size={20}/>
                        <select
                            className="select h-2 !border-none !outline-none focus:!border-none focus:!outline-none active:!border-none active:!outline-none"
                            {...register('address.country')}>
                            <option value="">Country</option>
                            {COUNTRIES.map((country) => (
                                <option key={country.code} value={country.code}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                        {errors.address?.country && (
                            <small className="validator-hint visible text-error my-0">
                                {errors.address?.country.message}
                            </small>
                        )}
                    </label>
                </div>

                <label className="label col-span-1">
                    <input type="checkbox" className="checkbox checkbox-primary" {...register('isPickUp')}/>
                    I will pick-up in store
                </label>
            </div>
        </div>
    );
}