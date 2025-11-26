'use client'

import React from 'react';
import ProductFilter from "@/app/View/product/ProductFilter";
import ProductList from "@/app/View/product/ProductList";



function Product() {
    return (
        <div className="flex justify-center m-2 p-2">
            <div className="flex flex-col">
                <ProductFilter />
                <ProductList/>
            </div>
        </div>
    );
}

export default Product;