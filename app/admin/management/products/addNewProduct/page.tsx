'use client'
import React from 'react';
import Link from "next/link";
import {ADMIN_MANAGEMENTS} from "@/app/Util/constants/paths";
import {addNewProductSchema} from "@/app/busniessLogic/Product/productValidation";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {AddNewProductForm} from "@/app/services/ProductService";
import {useQueryClient} from "@tanstack/react-query";
import {
    buildProductFormData,
    GET_ALL_PRODUCTS_QUERY_KEY,
    useCreateProduct,
    useProductImageHandlers
} from "@/app/busniessLogic/Product/productManager";
import {useToastNotifications} from "@/app/Util/toast";
import UnexpectedError from "@/app/View/Component/UnexpectedError";
import SuccessToast from "@/app/View/Component/SuccessToast";
import ProductBasicInfoFields from "@/app/admin/management/products/ProductBasicInfoFields";
import ProductImageFields from "@/app/admin/management/products/ProductImageFields";
import ProductDescriptionFields from "@/app/admin/management/products/ProductDescriptionFields";

function AddNewProduct() {
    const MAX_SECONDARY_IMAGES = 6;

    const { register, handleSubmit, reset, formState: { errors }, setError } = useForm({
        resolver: zodResolver(addNewProductSchema),
    });
    const queryClient = useQueryClient();
    const createProduct = useCreateProduct();
    const isPending = createProduct.isPending;
    const { error, toastMessage, showError, showSuccess } = useToastNotifications();

    // Use custom hook for image handling
    const {
        primaryImage,
        primaryImagePreview,
        secondaryImages,
        setPrimaryImage,
        setPrimaryImagePreview,
        setSecondaryImages,
        handleSecondaryImageChange,
        handleAddSecondaryImage,
        handleClearSecondaryImage,
        handleRemoveSecondaryImageCard,
        resetImages,
    } = useProductImageHandlers(MAX_SECONDARY_IMAGES);

    // Handle form submission
    const onSubmit: SubmitHandler<AddNewProductForm> = (data: AddNewProductForm) => {
        // Validate primary image manually
        if (!primaryImage) {
            setError('imageValidation.mainImage', {
                type: 'manual',
                message: 'Main image is required'
            });
            return;
        }

        try {
            // Build FormData using utility function
            const formData = buildProductFormData(data, primaryImage, secondaryImages);

            createProduct.mutate(formData, {
                onSuccess: () => {
                    showSuccess('Product is created!');

                    // Reset form and images
                    reset();
                    resetImages();

                    // Invalidate queries
                    queryClient.invalidateQueries({queryKey: [GET_ALL_PRODUCTS_QUERY_KEY]});
                },
                onError: (error) => {
                    console.log(error.message);
                    showError("Oops. Something went wrong!");
                },
            });
        } catch (error) {
            showError((error as Error).message || 'Failed to create product');
        }
    };

    return (
        <div className=" m-2 p-1 w-full">
            <UnexpectedError errorMessage={error} />
            {toastMessage && <SuccessToast toastMessage ={toastMessage}/>}
            <div className="breadcrumbs text-sm">
                <ul>
                    <li><Link className="link-primary" href={ADMIN_MANAGEMENTS.PRODUCTS.VIEW}>Product Management</Link>
                    </li>
                    <li>Add New Product</li>
                </ul>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4 m-2">
                    {/* Basic Product Info */}
                    <ProductBasicInfoFields register={register} errors={errors} title={"Add New Product"} />

                    {/* Image Upload Section */}
                    <ProductImageFields
                        register={register}
                        errors={errors}
                        isPending={isPending}
                        primaryImage={primaryImage}
                        primaryImagePreview={primaryImagePreview}
                        setPrimaryImage={setPrimaryImage}
                        setPrimaryImagePreview={setPrimaryImagePreview}
                        secondaryImages={secondaryImages}
                        setSecondaryImages={setSecondaryImages}
                        handleSecondaryImageChange={handleSecondaryImageChange}
                        handleAddSecondaryImage={handleAddSecondaryImage}
                        handleClearSecondaryImage={handleClearSecondaryImage}
                        handleRemoveSecondaryImageCard={handleRemoveSecondaryImageCard}
                        maxSecondaryImages={MAX_SECONDARY_IMAGES}
                    />

                    {/* Description Fields */}
                    <ProductDescriptionFields register={register} errors={errors} />
                </fieldset>
                <div className="flex w-full justify-center">
                    <button type="submit" className="btn btn-lg btn-success m-2" disabled={isPending}>
                        {isPending ? 'Creating Product...' : 'Create Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddNewProduct;