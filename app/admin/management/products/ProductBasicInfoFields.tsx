import React from 'react';
import {FieldErrors, UseFormRegister} from "react-hook-form";
import {AddNewProductForm} from "@/app/services/ProductService";
import {HiQuestionMarkCircle} from "react-icons/hi";
import {RiCharacterRecognitionLine} from "react-icons/ri";
import {FaBarcode} from "react-icons/fa";
import {IoPricetagOutline} from "react-icons/io5";
import {ProductType, Badge} from "@prisma/client";
import {CiDollar} from "react-icons/ci";
import {BsBox} from "react-icons/bs";
import {MdOutlineDashboardCustomize} from "react-icons/md";
import {MdLocalOffer} from "react-icons/md";
import {BsCalendarEvent} from "react-icons/bs";

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
                            placeholder="Regular Price"
                        />
                    </label>
                    {errors.price && (
                        <small className="validator-hint visible my-0 text-error">
                            {errors.price.message}
                        </small>
                    )}
                </div>
                <div className="flex flex-col gap-1 px-2">
                    <label className="label">Sale Price</label>
                    <label className={`input validator w-full ${errors.salePrice ? 'input-error' : ''}`}>
                        <CiDollar size={20}/>
                        <input
                            type="number"
                            step="0.01"
                            {...register("salePrice", {valueAsNumber: true})}
                            placeholder="Sale Price (Optional)"
                        />
                    </label>
                    {errors.salePrice && (
                        <small className="validator-hint visible my-0 text-error">
                            {errors.salePrice.message}
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
                <div className="flex flex-col gap-1 px-2">
                    <label className="label">Sale End Date
                        <div className="tooltip tooltip-right" data-tip="Optional - When the sale expires">
                            <HiQuestionMarkCircle/>
                        </div>
                    </label>
                    <label className={`input validator w-full ${errors.saleEndDate ? 'input-error' : ''}`}>
                        <BsCalendarEvent size={20}/>
                        <input
                            type="date"
                            {...register("saleEndDate", {
                                setValueAs: (value) => value ? new Date(value) : undefined
                            })}
                            placeholder="Sale End Date (Optional)"
                        />
                    </label>
                    {errors.saleEndDate && (
                        <small className="validator-hint visible my-0 text-error">
                            {errors.saleEndDate.message}
                        </small>
                    )}
                </div>
            </div>

            {/* Badges Section */}
            <div className="mt-4">
                <label className="label">
                    <span>Product Badges</span>
                    <div className="tooltip tooltip-right" data-tip="Select badges to display on product (e.g., NEW, HOT, BESTSELLER)">
                        <HiQuestionMarkCircle/>
                    </div>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 p-4 bg-base-100 rounded-lg">
                    {Object.values(Badge).map((badge) => (
                        <label key={badge} className="flex items-center gap-2 cursor-pointer hover:bg-base-200 p-2 rounded">
                            <input
                                type="checkbox"
                                value={badge}
                                {...register("badges")}
                                className="checkbox checkbox-primary checkbox-sm"
                            />
                            <span className={`badge badge-sm ${getBadgeColorClass(badge)}`}>
                                {badge}
                            </span>
                        </label>
                    ))}
                </div>
                {errors.badges && (
                    <small className="validator-hint visible my-0 text-error">
                        {errors.badges.message}
                    </small>
                )}
            </div>
        </>
    );
}

// Helper function to get badge colors for preview
function getBadgeColorClass(badge: Badge): string {
    switch (badge) {
        case Badge.NEW: return "badge-primary";
        case Badge.HOT: return "badge-error";
        case Badge.SALE: return "badge-warning";
        case Badge.LIMITED: return "badge-info";
        case Badge.BESTSELLER: return "badge-success";
        case Badge.TRENDING: return "badge-secondary";
        default: return "badge-neutral";
    }
}

export default ProductBasicInfoFields;