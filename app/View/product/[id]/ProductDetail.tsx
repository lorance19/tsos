"use client"
import React, {useState} from 'react';
import {useParams} from "next/navigation";
import {useAuth} from "@/app/auth/context";
import {calculateDiscountPercent, isSaleActive, useGetProductById} from "@/app/busniessLogic/Product/productManager";
import {useCartContext} from "@/app/View/product/CartContext";
import Image from "next/image";
import StarRating from "@/app/View/Component/StarRating";
import {$Enums, Color} from "@prisma/client";
import Badge = $Enums.Badge;
import ImageZoom from "@/app/View/Component/Image/ImageZoom";
import {BsExclamationCircle} from "react-icons/bs";

// Helper function to get badge color
function getBadgeColor(badge: Badge): string {
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


function ProductDetail() {
    const params = useParams();
    const {user} = useAuth();
    const productId = params.id as string;
    const {addToCart} = useCartContext();

    const { data: product, isLoading: isLoadingProduct } = useGetProductById(productId, user);

    // State for selected color variant (for image gallery)
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    if (isLoadingProduct) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="hero min-h-screen">
                <div className="hero-content text-center">
                    <div className="max-w-md">
                        <h1 className="text-5xl font-bold">Product Not Found</h1>
                        <p className="py-6">The product you are looking for does not exist or has been removed.</p>
                        <a href="/View/product" className="btn btn-primary">Browse Products</a>
                    </div>
                </div>
            </div>
        );
    }

    // Get current color variant images
    const currentColorVariant = product.imageColorInfo?.[selectedColorIndex];
    const allImages = currentColorVariant
        ? [currentColorVariant.mainImagePath, ...(currentColorVariant.secondaryImagesPaths || [])]
        : [product.mainImagePath];
    const currentImage = allImages[selectedImageIndex] || product.mainImagePath;

    // Calculate pricing
    const onSale = product.salePrice && isSaleActive(product.saleEndDate);
    const displayPrice = onSale ? product.salePrice! : product.price;
    const discountPercent = onSale ? calculateDiscountPercent(product.price, product.salePrice) : 0;

    // Prepare product data for cart (convert to ProductViewInfo format)
    const productForCart = {
        id: product.id,
        name: product.name,
        type: product.type,
        price: product.price,
        salePrice: product.salePrice,
        rating: product.rating || 0,
        mainImagePath: product.mainImagePath,
        badges: product.badges || [],
        saleEndDate: product.saleEndDate,
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Image Gallery */}
                <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative w-full h-[500px] bg-base-200 rounded-lg overflow-hidden">
                        <ImageZoom
                            src={currentImage}
                            alt={product.name}
                            quality={90}
                        />
                    </div>

                    {/* Thumbnail Images */}
                    {allImages.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto h-25">
                            {allImages.map((imgPath, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImageIndex(idx)}
                                    className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                                        selectedImageIndex === idx
                                            ? 'border-primary scale-105'
                                            : 'border-base-300 hover:border-primary/50'
                                    }`}
                                >
                                    <Image
                                        src={imgPath}
                                        alt={`${product.name} view ${idx + 1}`}
                                        fill
                                        style={{objectFit: "cover"}}
                                        sizes="80px"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Color Selection */}
                    {product.imageColorInfo && product.imageColorInfo.length > 1 && (
                        <div className="space-y-2">
                            <p className="font-semibold">Available Colors:</p>
                            <div className="flex gap-2 flex-wrap">
                                {product.imageColorInfo.map((colorInfo: Color, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedColorIndex(idx);
                                            setSelectedImageIndex(0);
                                        }}
                                        className={`btn btn-sm ${
                                            selectedColorIndex === idx
                                                ? 'btn-primary'
                                                : 'btn-outline'
                                        }`}
                                    >
                                        {colorInfo || `Option ${idx + 1}`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Product Details */}
                <div className="space-y-6">
                    {/* Product Name */}
                    <div>
                        <h4 className="text-3xl font-bold mb-2">{product.name}</h4>
                        <p className="text-sm text-base-content/60">Product Code: {product.code}</p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                        <StarRating rating={product.rating || 0} />
                        {product.rating && (
                            <span className="text-sm text-base-content/60">
                                ({product.rating.toFixed(1)})
                            </span>
                        )}
                    </div>

                    {/* Price */}
                    <div className="space-y-1">
                        {onSale ? (
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-bold text-error">${displayPrice}</span>
                                <span className="text-xl text-base-content/50 line-through">${product.price}</span>
                                <span className="text-error">Save {discountPercent}%</span>
                            </div>
                        ) : (
                            <div className="text-3xl font-bold text-primary">${displayPrice}</div>
                        )}
                    </div>

                    {/* Stock Status */}
                    <div>
                        {product.isOutOfStock ? (
                            <div className="badge badge-error badge-lg">Out of Stock</div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="badge badge-success badge-lg">In Stock</div>
                                <span className="text-sm text-base-content/60">
                                    ({product.inventory} available)
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Product Type */}
                    <div className="flex gap-2 items-center">
                        <span className="font-semibold">Category:</span>
                        <span className="badge badge-outline badge-lg">{product.type}</span>
                    </div>

                    {/* Customizable */}
                    {product.isCustomizable && (
                        <div className="alert border-blue-400 alert-outline">
                            <BsExclamationCircle/>
                            <span>This product can be customized to your preferences</span>
                        </div>
                    )}

                    {/* Add to Cart Button */}
                    <button
                        onClick={() => addToCart(productForCart)}
                        disabled={product.isOutOfStock}
                        className={`btn btn-primary btn-lg lg:w-1/2 w-full ${product.isOutOfStock ? "btn-default" : ""}`}
                    >
                        {product.isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>

                    {/* Divider */}
                    <div className="divider"></div>

                    {/* Product Description */}
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Product Details</h2>
                            <p className="text-base-content/80 whitespace-pre-line">
                                {product.detailDescription}
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-2">Care Instructions</h2>
                            <p className="text-base-content/80 whitespace-pre-line">
                                {product.careDescription}
                            </p>
                        </div>
                    </div>

                    {/* Admin Note (if present and user is admin) */}
                    {product.note && user && ['ADMIN', 'ROOT'].includes(user.role) && (
                        <div className="alert alert-warning">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <div className="font-bold">Admin Note:</div>
                                <div className="text-sm">{product.note.content}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;