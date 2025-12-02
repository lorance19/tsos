'use client'
import React, {useEffect, useState} from 'react';
import {useGetAllProductsForView} from "@/app/busniessLogic/Product/productManager";
import {IoMdCloseCircleOutline} from "react-icons/io";
import {$Enums, ProductType} from "@prisma/client";
import Badge = $Enums.Badge;
import ProductDisplay from "@/app/View/product/ProductDisplay";
import Pagination from "@/app/View/Component/Pagination";
import {SortOption} from "@/app/View/product/ProductFilter";

export interface ProductViewInfo {
    id: string;
    name: string;
    type: ProductType;
    price: number;
    salePrice: number | null;
    rating: number;
    mainImagePath: string;
    badges: Badge[];
    saleEndDate: Date | null;
}

interface ProductListProps {
    sortBy: SortOption;
    filterType: ProductType | 'all';
}

function ProductList({ sortBy, filterType }: ProductListProps) {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    // Reset to page 1 when filters or sort changes
    useEffect(() => {
        setPage(1);
    }, [sortBy, filterType]);

    const {data, isLoading, error} = useGetAllProductsForView({
        page,
        limit,
        sortBy,
        filterType
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
            <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-2 items-start">
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