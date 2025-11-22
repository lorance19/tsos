import React from 'react';
import {FieldErrors, UseFormRegister} from "react-hook-form";
import {AddNewProductForm} from "@/app/services/ProductService";

interface ProductDescriptionFieldsProps {
    register: UseFormRegister<AddNewProductForm>;
    errors: FieldErrors<AddNewProductForm>;
}

function ProductDescriptionFields({ register, errors }: ProductDescriptionFieldsProps) {
    return (
        <>
            <p className="text-xl font-semibold mt-2">Description & Note</p>
            <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 gap-4">
                <fieldset className="fieldset w-full">
                    <legend className="fieldset-legend">Detail Description</legend>
                    <textarea
                        className={`textarea h-50 w-full ${errors.detailDescription ? 'textarea-error' : ''}`}
                        {...register('detailDescription')}
                        placeholder="Detail Description"
                    />
                    {errors.detailDescription && (
                        <small className="validator-hint visible my-0 text-error">
                            {errors.detailDescription.message}
                        </small>
                    )}
                </fieldset>
                <fieldset className="fieldset w-full">
                    <legend className="fieldset-legend">Care Description</legend>
                    <textarea
                        className={`textarea h-50 w-full validator ${errors.careDescription ? 'input-error' : ''}`}
                        {...register('careDescription')}
                        placeholder="Care Description"
                    />
                    {errors.careDescription && (
                        <small className="validator-hint visible my-0 text-error">
                            {errors.careDescription.message}
                        </small>
                    )}
                </fieldset>
            </div>
        </>
    );
}

export default ProductDescriptionFields;