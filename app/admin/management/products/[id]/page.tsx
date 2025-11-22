"use client"
import React, {useEffect, useState} from 'react';
import {useParams, useRouter} from "next/navigation";
import Link from "next/link";
import {ADMIN_MANAGEMENTS} from "@/app/Util/constants/paths";
import {addNewProductSchema} from "@/app/busniessLogic/Product/productValidation";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {AddNewProductForm} from "@/app/services/ProductService";
import {useQueryClient} from "@tanstack/react-query";
import {GET_ALL_PRODUCTS_QUERY_KEY, useGetProductById, useUpdateProduct} from "@/app/busniessLogic/Product/productManager";
import {useToastNotifications} from "@/app/Util/toast";
import UnexpectedError from "@/app/View/Component/UnexpectedError";
import SuccessToast from "@/app/View/Component/SuccessToast";
import ProductBasicInfoFields from "@/app/admin/management/products/ProductBasicInfoFields";
import ProductImageFields from "@/app/admin/management/products/ProductImageFields";
import ProductDescriptionFields from "@/app/admin/management/products/ProductDescriptionFields";

function EditProduct() {
    const params = useParams();
    const productId = params.id as string;
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: product, isLoading: isLoadingProduct } = useGetProductById(productId);
    const updateProduct = useUpdateProduct(productId);
    const isPending = updateProduct.isPending;
    const { error, toastMessage, showError, showSuccess } = useToastNotifications();

    const { register, handleSubmit, reset, formState: { errors }, setError } = useForm<AddNewProductForm>({
        resolver: zodResolver(addNewProductSchema),
    });

    // Image state
    const [primaryImage, setPrimaryImage] = useState<File | null>(null);
    const [primaryImagePreview, setPrimaryImagePreview] = useState<string>('https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp');

    // Secondary images state
    const [secondaryImages, setSecondaryImages] = useState<Array<{file: File | null, preview: string}>>([
        { file: null, preview: 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp' }
    ]);

    const MAX_SECONDARY_IMAGES = 6;

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
            if (product.mainImagePath) {
                setPrimaryImagePreview(product.mainImagePath);
            }

            // Set secondary images (existing images from server)
            if (product.imageColorInfo && product.imageColorInfo.length > 0) {
                const existingSecondaryImages = product.imageColorInfo[0].secondaryImagesPaths || [];
                if (existingSecondaryImages.length > 0) {
                    setSecondaryImages(
                        existingSecondaryImages.map((path: string) => ({
                            file: null,
                            preview: path
                        }))
                    );
                }
            }
        }
    }, [product, reset]);

    // Handle secondary image selection
    const handleSecondaryImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSecondaryImages(prev => {
                    const updated = [...prev];
                    updated[index] = { file, preview: reader.result as string };
                    return updated;
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddSecondaryImage = () => {
        if (secondaryImages.length < MAX_SECONDARY_IMAGES) {
            setSecondaryImages(prev => [
                ...prev,
                { file: null, preview: 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp' }
            ]);
        }
    };

    const handleClearSecondaryImage = (index: number) => {
        setSecondaryImages(prev => {
            const updated = [...prev];
            updated[index] = { file: null, preview: 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp' };
            return updated;
        });
        const fileInput = document.getElementById(`secondary-image-input-${index}`) as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleRemoveSecondaryImageCard = (index: number) => {
        setSecondaryImages(prev => prev.filter((_, i) => i !== index));
    };

    // Handle form submission
    const onSubmit: SubmitHandler<AddNewProductForm> = (data: AddNewProductForm) => {
        try {
            // Build FormData for multipart upload
            const formData = new FormData();

            // Add regular fields
            formData.append('name', data.name);
            formData.append('code', data.code);
            formData.append('type', data.type);
            formData.append('price', data.price.toString());
            formData.append('inventory', data.inventory.toString());
            formData.append('isCustomizable', data.isCustomizable.toString());
            formData.append('detailDescription', data.detailDescription);
            formData.append('careDescription', data.careDescription);
            if (data.note) formData.append('note', data.note);
            if (data.deal) formData.append('deal', data.deal);

            // Add primary image only if a new one was selected
            if (primaryImage) {
                formData.append('imageValidation.mainImage', primaryImage);
            }

            // Add secondary images only if new ones were selected
            const validSecondaryImages = secondaryImages
                .filter(img => img.file !== null)
                .map(img => img.file as File);

            validSecondaryImages.forEach((file) => {
                formData.append('imageValidation.secondaryImages', file);
            });

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