import React from 'react';
import {ProductType} from "@prisma/client";

export type SortOption = 'newest' | 'price_low_high' | 'rating_high_low';

interface ProductFilterProps {
    sortBy: SortOption;
    onSortChange: (sort: SortOption) => void;
    filterType: ProductType | 'all';
    onFilterTypeChange: (type: ProductType | 'all') => void;
}

function ProductFilter({ sortBy, onSortChange, filterType, onFilterTypeChange }: ProductFilterProps) {
    return (
        <div className="py-3 sticky top-0 z-30 bg-base-100">
            <div className="flex flex-row gap-4 justify-end">
                {/* Sort By Section */}
                <div className="flex flex-col gap-2">
                    <label className="font-semibold text-sm">Sort By:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value as SortOption)}
                        className="select select-bordered"
                    >
                        <option value="newest">Newest</option>
                        <option value="price_low_high">Price: Low to High</option>
                        <option value="rating_high_low">Rating: High to Low</option>
                    </select>
                </div>

                {/* Filter by Type Section */}
                <div className="flex flex-col gap-2">
                    <label className="font-semibold text-sm">Filter by Type:</label>
                    <select
                        value={filterType}
                        onChange={(e) => onFilterTypeChange(e.target.value as ProductType | 'all')}
                        className="select select-bordered"
                    >
                        <option value="all">All Products</option>
                        <option value={ProductType.HARDWARE}>Hardware</option>
                        <option value={ProductType.CURTAIN}>Curtain</option>
                        <option value={ProductType.PILLOW}>Pillow</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

export default ProductFilter;