import React from 'react';
import {ProductViewInfo} from "@/app/View/product/ProductList";
import Link from "next/link";
import ImageWithBadgeAtTop from "@/app/View/Component/Image/ImageWithBadgeAtTop";
import StarRating from "@/app/View/Component/StarRating";
import {useCartContext} from "@/app/View/product/CartContext";
import {PRODUCT} from "@/app/Util/constants/paths";
import {$Enums} from "@prisma/client";
import Badge = $Enums.Badge;

// Helper functions
function calculateDiscountPercent(price: number, salePrice: number | null): number {
    if (!salePrice || salePrice >= price) return 0;
    return Math.round(((price - salePrice) / price) * 100);
}

function isSaleActive(saleEndDate: Date | null): boolean {
    if (!saleEndDate) return true;
    return new Date(saleEndDate) > new Date();
}

function ProductDisplay(props : ProductViewInfo) {
    const { addToCart } = useCartContext();

    // Calculate pricing
    const onSale = props.salePrice && isSaleActive(props.saleEndDate);
    const displayPrice = onSale ? props.salePrice : props.price;
    const discountPercent = onSale ? calculateDiscountPercent(props.price, props.salePrice) : 0;

    // Prepare badge info for ImageWithBadgeAtTop
    const primaryBadge = props.badges && props.badges.length > 0
        ? { text: props.badges[0], bgColor: undefined }
        : (onSale && discountPercent > 0
            ? { text: `${discountPercent}% OFF`, bgColor: undefined }
            : undefined);

    return (
        <Link href={PRODUCT.STANDALONE(props.id).VIEW} className="h-[35rem] hover:cursor-pointer
            overflow-hidden
            transition delay-120
            duration-100
            ease-in
            hover:scale-102">
            <ImageWithBadgeAtTop
                image={props.mainImagePath}
                title={props.name}
                link={props.id}
                primaryBadge={primaryBadge}
            />
            <div className="flex flex-col">
                <div className="font-sans font-light text-lg m-2">{props.name}</div>
                <StarRating rating={props.rating}/>
                <div className="flex flex-row justify-between gap-2">
                    {/* Price Display */}
                    <div className="flex flex-col mx-2">
                        {onSale ? (
                            <>
                                <span className="font-open text-error">${displayPrice} (Save ${discountPercent}%)</span>
                                <span className="text-sm text-base-content/50 line-through">${props.price}</span>
                            </>
                        ) : (
                            <span className="font-thin">${props.price}</span>
                        )}
                    </div>

                    {/*Need to add preventDefault() and stopPropagation because the whole button is embeded in
                        <Link> and without these handlers, clicking "Add to Cart" would both add the item to cart
                        AND navigate to the product page, which isn't the desired behavior
                    */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart(props);
                        }}
                        className="btn btn-outline btn-secondary hover:bg-primary
                        transition-colors active:scale-95"
                    >
                        Add to Cart
                    </button>
                </div>


            </div>
        </Link>
    );
}

export default ProductDisplay;