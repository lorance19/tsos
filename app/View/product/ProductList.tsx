'use client'
import React, {useState} from 'react';
import {useGetAllProductsForView} from "@/app/busniessLogic/Product/productManager";
import {IoMdCloseCircleOutline} from "react-icons/io";
import {$Enums, ProductType} from "@prisma/client";
import Deals = $Enums.Deals;
import ProductDisplay from "@/app/View/product/ProductDisplay";
import Pagination from "@/app/View/Component/Pagination";

export interface ProductViewInfo {
    id: string;
    name: string;
    type: ProductType;
    price: number;
    rating: number;
    mainImagePath: string;
    deals: Deals[];
}

function ProductList() {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const {data, isLoading, error} = useGetAllProductsForView({
        page,
        limit
    })

    if (isLoading) {
        return (
            <span className="loading loading-dots loading-xl"></span>
        );
    }

    if (!data?.products) {
        return (
            <div role="alert" className="alert alert-info alert-soft">
                <span>No Products to be shown</span>
            </div>
        );
    }

    if (error) {
        return(
            <div role="alert" className="alert alert-error">
                <IoMdCloseCircleOutline/>
                <span>Error! Failed to load product list</span>
            </div>
        )
    }

    const products: ProductViewInfo[] = data?.products;


    return (
        <div className="flex flex-col">
            <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-2">
                {products.map((p) => (
                    <ProductDisplay key={p.id} {...p} />
                ))}
            </div>
            <Pagination
                currentPage={page}
                totalPages={data.totalPages}
                onPageChange={setPage}
            />
        </div>
    );
}

export default ProductList;