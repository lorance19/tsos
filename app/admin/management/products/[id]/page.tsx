"use client"
import React, {useEffect} from 'react';
import {useParams, useRouter} from "next/navigation";
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
    useGetProductById,
    useProductImageHandlers,
    useUpdateProduct
} from "@/app/busniessLogic/Product/productManager";
import {useToastNotifications} from "@/app/Util/toast";
import UnexpectedError from "@/app/View/Component/UnexpectedError";
import SuccessToast from "@/app/View/Component/SuccessToast";
import ProductBasicInfoFields from "@/app/admin/management/products/ProductBasicInfoFields";
import ProductImageFields from "@/app/admin/management/products/ProductImageFields";
import ProductDescriptionFields from "@/app/admin/management/products/ProductDescriptionFields";
import {useAuth} from "@/app/auth/context";

function EditProduct() {
    const MAX_SECONDARY_IMAGES = 6;

    const params = useParams();
    const productId = params.id as string;
    const router = useRouter();
    const queryClient = useQueryClient();
    const {user} = useAuth();

    const { data: product, isLoading: isLoadingProduct } = useGetProductById(productId, user!);
    const updateProduct = useUpdateProduct(productId);
    const isPending = updateProduct.isPending;
    const { error, toastMessage, showError, showSuccess } = useToastNotifications();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<AddNewProductForm>({
        resolver: zodResolver(addNewProductSchema),
    });

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
    } = useProductImageHandlers(MAX_SECONDARY_IMAGES);

    // Populate form when product data loads
    useEffect(() => {
        if (product) {
            // Reset entire form with product data
            reset({
                name: product.name,
                code: product.code,
                type: product.type,
                price: product.price,
                inventory: product.inventory,
                isCustomizable: product.isCustomizable,
                detailDescription: product.detailDescription,
                careDescription: product.careDescription,
                note: product.note?.note || '',
                deal: product.deals?.[0] || undefined,
                // Image validation fields - not needed for edit but required by schema
                imageValidation: {
                    mainImage: null as any, // Will handle separately
                    secondaryImages: [] as any
                }
            });

            // Set primary image preview (existing image from server)
            // Add cache-busting parameter to force browser to reload image
            if (product.mainImagePath) {
                setPrimaryImagePreview(`${product.mainImagePath}?v=${Date.now()}`);
            }

            // Set secondary images (existing images from server)
            if (product.imageColorInfo && product.imageColorInfo.length > 0) {
                const existingSecondaryImages = product.imageColorInfo[0].secondaryImagesPaths || [];
                if (existingSecondaryImages.length > 0) {
                    setSecondaryImages(
                        existingSecondaryImages.map((path: string) => ({
                            file: null,
                            preview: `${path}?v=${Date.now()}`
                        }))
                    );
                }
            }
        }
    }, [product, reset, setPrimaryImagePreview, setSecondaryImages]);

    // Handle form submission
    const onSubmit: SubmitHandler<AddNewProductForm> = (data: AddNewProductForm) => {
        try {
            // Build FormData using utility function
            const formData = buildProductFormData(data, primaryImage, secondaryImages);

            updateProduct.mutate(formData, {
                onSuccess: () => {
                    showSuccess('Product updated successfully!');

                    // Invalidate queries
                    queryClient.invalidateQueries({queryKey: [GET_ALL_PRODUCTS_QUERY_KEY]});

                    // Navigate back to products list after a delay
                    setTimeout(() => {
                        router.push(ADMIN_MANAGEMENTS.PRODUCTS.VIEW);
                    }, 1500);
                },
                onError: (error) => {
                    console.log(error.message);
                    showError("Oops. Something went wrong!");
                },
            });
        } catch (error) {
            showError((error as Error).message || 'Failed to update product');
        }
    };

    if (isLoadingProduct) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="p-4">
                <div className="alert alert-error">
                    <span>Product not found</span>
                </div>
            </div>
        );
    }

    return (
        <div className="m-2 p-1 w-full">
            <UnexpectedError errorMessage={error} />
            {toastMessage && <SuccessToast toastMessage={toastMessage}/>}

            <div className="breadcrumbs text-sm">
                <ul>
                    <li>
                        <Link className="link-primary" href={ADMIN_MANAGEMENTS.PRODUCTS.VIEW}>
                            Product Management
                        </Link>
                    </li>
                    <li>Edit Product</li>
                    <li>{product.name}</li>
                </ul>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4 m-2">
                    {/* Basic Product Info */}
                    <ProductBasicInfoFields register={register} errors={errors} title={"Edit Product"}/>

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

                <div className="flex w-full justify-center gap-2">
                    <Link
                        href={ADMIN_MANAGEMENTS.PRODUCTS.VIEW}
                        className="btn btn-lg btn-ghost m-2"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="btn btn-lg btn-primary m-2"
                        disabled={isPending}
                    >
                        {isPending ? 'Updating Product...' : 'Update Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditProduct;