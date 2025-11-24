import React from 'react';
import {ProductViewInfo} from "@/app/View/product/ProductList";
import Link from "next/link";
import ImageWithBadgeAtTop from "@/app/View/Component/Image/ImageWithBadgeAtTop";
import StarRating from "@/app/View/Component/StarRating";

function ProductDisplay(props : ProductViewInfo) {
    return (
        <Link href="/" className="h-[35rem] hover:cursor-pointer
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
                <div className="font-thin mx-2">${props.price}</div>
            </div>
        </Link>
    );
}

export default ProductDisplay;