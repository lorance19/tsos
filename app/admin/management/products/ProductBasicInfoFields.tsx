import React from 'react';
import {FieldErrors, UseFormRegister} from "react-hook-form";
import {AddNewProductForm} from "@/app/services/ProductService";
import {HiQuestionMarkCircle} from "react-icons/hi";
import {RiCharacterRecognitionLine} from "react-icons/ri";
import {FaBarcode} from "react-icons/fa";
import {IoPricetagOutline} from "react-icons/io5";
import {ProductType} from "@prisma/client";
import {CiDollar} from "react-icons/ci";
import {BsBox} from "react-icons/bs";
import {MdOutlineDashboardCustomize} from "react-icons/md";

interface ProductBasicInfoFieldsProps {
    register: UseFormRegister<AddNewProductForm>;
    errors: FieldErrors<AddNewProductForm>;
    title: string;
}

function ProductBasicInfoFields({ register, errors, title }: ProductBasicInfoFieldsProps) {
    return (
        <>
            <p className="text-xl font-semibold">{title}</p>
            <div className="grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 gap-1">
                <div className="flex flex-col gap-1 px-2">
                    <label className="label">Product name
                        <div className="tooltip tooltip-right" data-tip="For view landing page">
                            <HiQuestionMarkCircle/>
                        </div>
                    </label>
                    <label className={`input validator w-full ${errors.name ? 'input-error' : ''}`}>
                        <RiCharacterRecognitionLine size={20}/>
                        <input
                            {...register('name')}
                            type="text"
                            placeholder="Product Name"
                        />
                    </label>
                    {errors.name?.message && (
                        <small className="validator-hint visible my-0 text-error">
                            {errors.name.message}
                        </small>
                    )}
                </div>
                <div className="flex flex-col gap-1 px-2">
                    <label className="label">Product Code
                        <div className="tooltip tooltip-right" data-tip="For management page only">
                            <HiQuestionMarkCircle/>
                        </div>
                    </label>
                    <label className={`input validator w-full ${errors.code ? 'input-error' : ''}`}>
                        <FaBarcode size={20}/>
                        <input
                            {...register('code')}
                            type="text"
                            placeholder="Product Code"
                        />
                    </label>
                    {errors.code && (
                        <small className="validator-hint visible my-0 text-error">
                            {errors.code.message}
                        </small>
                    )}
                </div>
                <div className="flex flex-col gap-1 px-2">
                    <label className="label">Product Type</label>
                    <label className={`input validator w-full ${errors.type ? 'input-error' : ''}`}>
                        <IoPricetagOutline size={20}/>
                        <select className="border-none w-full focus:outline-none focus:ring-0 focus:border-none"
                                {...register("type")}>
                            {Object.values(ProductType).map((item, index) => (
                                <option key={index} value={item}>{item}</option>
                            ))}
                        </select>
                    </label>
                    {errors.type && (
                        <small className="validator-hint visible my-0 text-error">
                            {errors.type.message}
                        </small>
                    )}
                </div>
                <div className="flex flex-col gap-1 px-2">
                    <label className="label">Price</label>
                    <label className={`input validator w-full ${errors.price ? 'input-error' : ''}`}>
                        <CiDollar size={20}/>
                        <input
                            type="number"
                            step="0.01"
                            {...register("price", {valueAsNumber: true})}
                            placeholder="Price tag"
                        />
                    </label>
                    {errors.price && (
                        <small className="validator-hint visible my-0 text-error">
                            {errors.price.message}
                        </small>
                    )}
                </div>
                <div className="flex flex-col gap-1 px-2">
                    <label className="label">Inventory</label>
                    <label className={`input validator w-full ${errors.inventory ? 'input-error' : ''}`}>
                        <BsBox size={20}/>
                        <input
                            type="number"
                            {...register("inventory", {valueAsNumber: true})}
                            placeholder="Inventory"
                        />
                    </label>
                    {errors.inventory && (
                        <small className="validator-hint visible my-0 text-error">
                            {errors.inventory.message}
                        </small>
                    )}
                </div>
                <div className="flex flex-col gap-1 px-2">
                    <label className="label">Is Customizable</label>
                    <label className={`input validator w-full`}>
                        <MdOutlineDashboardCustomize size={20}/>
                        <select
                            className="border-none w-full focus:outline-none focus:ring-0 focus:border-none"
                            {...register("isCustomizable", {
                                setValueAs: (value) => value === "true"
                            })}
                        >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </label>
                </div>
            </div>
        </>
    );
}

export default ProductBasicInfoFields;