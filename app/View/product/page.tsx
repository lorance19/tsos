'use client'

import React, {useState, useEffect} from 'react';
import {useSearchParams} from 'next/navigation';
import ProductFilter, {SortOption} from "@/app/View/product/ProductFilter";
import ProductList from "@/app/View/product/ProductList";
import {ProductType} from "@prisma/client";



function Product() {
    const searchParams = useSearchParams();
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [filterType, setFilterType] = useState<ProductType | 'all'>('all');

    // Read filterType from URL query parameter on mount
    useEffect(() => {
        const urlFilterType = searchParams.get('filterType');
        if (urlFilterType) {
            // Convert lowercase URL param to uppercase ProductType enum
            const filterTypeUpperCase = urlFilterType.toUpperCase() as ProductType;
            if (Object.values(ProductType).includes(filterTypeUpperCase)) {
                setFilterType(filterTypeUpperCase);
            }
        }
    }, [searchParams]);

    return (
        <div className="w-full px-4 py-8">
            <div className="flex flex-col w-full">
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