import React from 'react';
import {ProductViewInfo} from "@/app/View/product/ProductList";
import Link from "next/link";
import ImageWithBadgeAtTop from "@/app/View/Component/Image/ImageWithBadgeAtTop";
import StarRating from "@/app/View/Component/StarRating";
import {useCartContext} from "@/app/View/product/CartContext";
import {PRODUCT} from "@/app/Util/constants/paths";

function ProductDisplay(props : ProductViewInfo) {

    const { addToCart } = useCartContext();
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
            />
            <div className="flex flex-col">
                <div className="font-sans font-light text-lg m-2">{props.name}</div>
                <StarRating rating={props.rating}/>
                <div className="flex flex-row justify-between gap-2">
                    <div className="font-thin mx-2">${props.price}</div>

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