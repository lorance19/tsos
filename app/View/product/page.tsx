'use client'

import React, {useState} from 'react';
import ProductFilter, {SortOption} from "@/app/View/product/ProductFilter";
import ProductList from "@/app/View/product/ProductList";
import {ProductType} from "@prisma/client";



function Product() {
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [filterType, setFilterType] = useState<ProductType | 'all'>('all');

    return (
        <div className="flex justify-center m-2 p-2">
            <div className="flex flex-col">
                <ProductFilter
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    filterType={filterType}
                    onFilterTypeChange={setFilterType}
                />
                <ProductList
                    sortBy={sortBy}
                    filterType={filterType}
                />
            </div>
        </div>
    );
}

export default Product;