import React from 'react';
import {FieldErrors, UseFormRegister} from "react-hook-form";
import {AddNewProductForm} from "@/app/services/ProductService";
import {HiQuestionMarkCircle} from "react-icons/hi";
import {IoAddSharp, IoCloseCircle, IoRemoveSharp} from "react-icons/io5";
import Image from "next/image";

interface SecondaryImageState {
    file: File | null;
    preview: string;
}

interface ProductImageFieldsProps {
    register: UseFormRegister<AddNewProductForm>;
    errors: FieldErrors<AddNewProductForm>;
    isPending: boolean;

    // Primary image
    primaryImage: File | null;
    primaryImagePreview: string;
    setPrimaryImage: (file: File | null) => void;
    setPrimaryImagePreview: (preview: string) => void;

    // Secondary images
    secondaryImages: SecondaryImageState[];
    setSecondaryImages: React.Dispatch<React.SetStateAction<SecondaryImageState[]>>;
    handleSecondaryImageChange: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
    handleAddSecondaryImage: () => void;
    handleClearSecondaryImage: (index: number) => void;
    handleRemoveSecondaryImageCard: (index: number) => void;
    maxSecondaryImages: number;
}

function ProductImageFields({
    register,
    errors,
    isPending,
    primaryImage,
    primaryImagePreview,
    setPrimaryImage,
    setPrimaryImagePreview,
    secondaryImages,
    handleSecondaryImageChange,
    handleAddSecondaryImage,
    handleClearSecondaryImage,
    handleRemoveSecondaryImageCard,
    maxSecondaryImages
}: ProductImageFieldsProps) {
    return (
        <>
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
                            <div className="tooltip tooltip-right" data-tip="Shown in product list">
                                <HiQuestionMarkCircle/>
                            </div>
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
                                        <IoCloseCircle className="text-xl"/>
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
                                    <HiQuestionMarkCircle/>
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
                                            <IoCloseCircle className="text-xl"/>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="flex flex-col gap-2">
                    {secondaryImages.length < maxSecondaryImages && (
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
        </>
    );
}

export default ProductImageFields;