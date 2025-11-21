'use client'
import React, {useState} from 'react';
import Link from "next/link";
import {ADMIN_MANAGEMENTS} from "@/app/Util/constants/paths";
import {CiDollar, CiUser} from "react-icons/ci";
import {RiCharacterRecognitionLine} from "react-icons/ri";
import {HiQuestionMarkCircle} from "react-icons/hi";
import {IoAddSharp, IoCloseCircle, IoPricetagOutline, IoRemoveSharp} from "react-icons/io5";
import {FaBarcode} from "react-icons/fa";
import {MdOutlineDashboardCustomize} from "react-icons/md";
import {BsBox} from "react-icons/bs";
import {addNewProductSchema} from "@/app/busniessLogic/Product/productValidation";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {AddNewProductForm} from "@/app/services/ProductService";
import {useQueryClient} from "@tanstack/react-query";
import {useRouter} from "next/navigation";
import {GET_ALL_PRODUCTS_QUERY_KEY, useCreateProduct} from "@/app/busniessLogic/Product/productManager";
import {useToastNotifications} from "@/app/Util/toast";
import UnexpectedError from "@/app/View/Component/UnexpectedError";
import SuccessToast from "@/app/View/Component/SuccessToast";
import Image from "next/image";
import {ProductType} from "@prisma/client";

//TODO: This file is needs to be refactored!!!

function AddNewProduct() {
    const { register, handleSubmit, reset, formState: { errors }, setError } = useForm({
        resolver: zodResolver(addNewProductSchema),
    });
    const queryClient = useQueryClient();
    const router = useRouter();
    const createProduct = useCreateProduct();
    const isPending = createProduct.isPending;
    const { error, toastMessage, showError, showSuccess } = useToastNotifications();

    // Image state
    const [primaryImage, setPrimaryImage] = useState<File | null>(null);
    const [primaryImagePreview, setPrimaryImagePreview] = useState<string>('https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp');

    // Secondary images state (array of up to 6 images)
    const [secondaryImages, setSecondaryImages] = useState<Array<{file: File | null, preview: string}>>([
        { file: null, preview: 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp' }
    ]);

    const MAX_SECONDARY_IMAGES = 6;


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

    // Add new secondary image card
    const handleAddSecondaryImage = () => {
        if (secondaryImages.length < MAX_SECONDARY_IMAGES) {
            setSecondaryImages(prev => [
                ...prev,
                { file: null, preview: 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp' }
            ]);
        }
    };


    // Clear uploaded image (keeps the card)
    const handleClearSecondaryImage = (index: number) => {
        setSecondaryImages(prev => {
            const updated = [...prev];
            updated[index] = { file: null, preview: 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp' };
            return updated;
        });
        // Reset the file input
        const fileInput = document.getElementById(`secondary-image-input-${index}`) as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    // Remove entire secondary image card
    const handleRemoveSecondaryImageCard = (index: number) => {
        setSecondaryImages(prev => prev.filter((_, i) => i !== index));
    };

    // Handle form submission
    const onSubmit: SubmitHandler<AddNewProductForm>  =  (data: AddNewProductForm) => {
        // Validate primary image manually
        if (!primaryImage) {
            setError('imageValidation.mainImage', {
                type: 'manual',
                message: 'Main image is required'
            });
            return;
        }

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

            // Add primary image
            if (primaryImage) {
                formData.append('imageValidation.mainImage', primaryImage);
            }

            // Add secondary images
            const validSecondaryImages = secondaryImages
                .filter(img => img.file !== null)
                .map(img => img.file as File);

            validSecondaryImages.forEach((file, index) => {
                formData.append('imageValidation.secondaryImages', file);
            });

            createProduct.mutate(formData as FormData, {
                onSuccess: () => {
                    showSuccess('Product is created!');

                    // Reset form and images
                    reset();
                    setPrimaryImage(null);
                    setPrimaryImagePreview('https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp');
                    setSecondaryImages([
                        { file: null, preview: 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp' }
                    ]);

                    // Invalidate queries and redirect after a delay
                    queryClient.invalidateQueries({queryKey: [GET_ALL_PRODUCTS_QUERY_KEY]});
                },
                onError: (error) => {
                    console.log(error.message);
                    showError("Oops. Something went wrong!");
                },
            });
        } catch (error) {
            // Show error notification
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
                    <p className="text-xl font-semibold">New Product</p>
                    <div className="grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 gap-1">
                        <div className="flex flex-col gap-1 px-2">
                            <label className="label">Product name
                                <div className="tooltip tooltip-right" data-tip="For view landing page"><HiQuestionMarkCircle /></div>
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
                                <div className="tooltip tooltip-right" data-tip="For management page only"><HiQuestionMarkCircle /></div>
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
                                <select className="border-none w-full focus:outline-none focus:ring-0 focus:border-none" {...register("type")}>
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
                                    {...register("price", { valueAsNumber: true })}
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
                            <label className={`input validator w-full ${errors.inventory? 'input-error' : ''}`}>
                                <BsBox size={20}/>
                                <input
                                    type="number"
                                    {...register("inventory", { valueAsNumber: true })}
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

                    <p className="text-xl font-semibold mt-2">Display Images</p>
                    <div className="grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 gap-4">
                        {/* Primary Image Card */}
                        <div className="card bg-base-100 shadow-sm p-1">
                            <figure className="relative h-60">
                                <Image
                                    src={primaryImagePreview}
                                    alt={"Primary Product Image"}
                                    fill
                                    style={{objectFit: "contain"}}
                                    quality={90}
                                    loading="eager"
                                    priority
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />

                            </figure>
                            <div className="card-body">
                                <h2 className="card-title">
                                    Primary Image
                                    <div className="tooltip tooltip-right" data-tip="Shown in product list"><HiQuestionMarkCircle /></div>
                                </h2>
                                <div className="flex flex-col gap-1">
                                    <div className="flex gap-2">
                                        <input
                                            id="primary-image-input"
                                            type="file"
                                            accept="image/*"
                                            disabled={isPending}
                                            className={`file-input flex-1 ${errors.imageValidation?.mainImage ? "file-input-error" : "file-input-primary"}`}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setPrimaryImage(file);
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setPrimaryImagePreview(reader.result as string);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        {primaryImage && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPrimaryImage(null);
                                                    setPrimaryImagePreview('https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp');
                                                    const fileInput = document.getElementById('primary-image-input') as HTMLInputElement;
                                                    if (fileInput) fileInput.value = '';
                                                }}
                                                className="btn btn-error btn-square"
                                                disabled={isPending}
                                            >
                                                <IoCloseCircle className="text-xl" />
                                            </button>
                                        )}
                                    </div>
                                    {errors.imageValidation?.mainImage?.message && (
                                        <small className="text-error">
                                            {String(errors.imageValidation.mainImage.message)}
                                        </small>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Secondary Image Cards - Dynamically rendered */}
                        {secondaryImages.map((image, index) => (
                            <div key={index} className="card bg-base-100 shadow-sm p-1">
                                <figure className="relative h-60">
                                    <Image
                                        src={image.preview}
                                        alt={`Secondary Product Image ${index + 1}`}
                                        fill
                                        style={{objectFit: "contain"}}
                                        quality={90}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </figure>
                                <div className="card-body">
                                    <h2 className="card-title">
                                        Secondary Image {index + 1}
                                        <div className="tooltip tooltip-right" data-tip="Shown in product detail">
                                            <HiQuestionMarkCircle />
                                        </div>
                                    </h2>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex gap-2">
                                            <input
                                                id={`secondary-image-input-${index}`}
                                                type="file"
                                                accept="image/*"
                                                disabled={isPending}
                                                {...register("imageValidation.secondaryImages")}
                                                className={`file-input flex-1 file-input-primary`}
                                                onChange={(e) => handleSecondaryImageChange(index, e)}
                                            />
                                            {image.file && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleClearSecondaryImage(index)}
                                                    className="btn btn-error btn-square"
                                                    disabled={isPending}
                                                >
                                                    <IoCloseCircle className="text-xl" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="flex flex-col gap-2">
                            {secondaryImages.length < MAX_SECONDARY_IMAGES && (
                                <button
                                    type="button"
                                    onClick={handleAddSecondaryImage}
                                    className="card bg-base-100 shadow-sm hover:bg-base-200 hover:text-primary hover:cursor-pointer"
                                >
                                    <div className="flex justify-center items-center card-body">
                                        <IoAddSharp className="text-8xl"/>
                                    </div>
                                </button>
                            )}
                            {/* Remove Last Image Button - Only show if there are secondary images */}
                            {secondaryImages.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSecondaryImageCard(secondaryImages.length - 1)}
                                    className="card bg-base-100 shadow-sm hover:bg-base-200 hover:text-error hover:cursor-pointer"
                                    disabled={isPending}
                                >
                                    <div className="flex justify-center items-center card-body">
                                        <IoRemoveSharp className="text-8xl"/>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>

                    <p className="text-xl font-semibold mt-2">Description & Note</p>
                    <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 gap-4">
                        <fieldset className="fieldset w-full">
                            <legend className="fieldset-legend">Detail Description</legend>
                            <textarea className={`textarea h-50 w-full ${errors.detailDescription? 'textarea-error' : ''}`} {...register('detailDescription')} placeholder="Detail Description"></textarea>
                            {errors.detailDescription && (
                                <small className="validator-hint visible my-0 text-error">
                                    {errors.detailDescription.message}
                                </small>
                            )}
                        </fieldset>
                        <fieldset className="fieldset w-full">
                            <legend className="fieldset-legend">Care Description</legend>
                            <textarea className={`textarea h-50 w-full validator ${errors.careDescription? 'input-error' : ''}`} {...register('careDescription')} placeholder="Care Description"></textarea>
                            {errors.careDescription && (
                                <small className="validator-hint visible my-0 text-error">
                                    {errors.careDescription.message}
                                </small>
                            )}
                        </fieldset>

                    </div>
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