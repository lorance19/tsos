'use client'
import React, {useState} from 'react';
import {FaArchive} from "react-icons/fa";
import {CiSearch} from "react-icons/ci";
import Link from "next/link";
import {ADMIN_MANAGEMENTS} from "@/app/Util/constants/paths";
import {IoAdd} from "react-icons/io5";
import {useGetAllProducts} from "@/app/busniessLogic/Product/productManager";
import {ProductType} from "@prisma/client";
import Pagination from "@/app/View/Component/Pagination";

interface ProductInfo {
    id: string;
    code: string;
    name: string;
    type: ProductType;
    price: number;
    inventory: number;
    isOutOfStock: boolean;
}

function Page() {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<ProductType | "ALL">("ALL");
    const [inventoryFilter, setInventoryFilter] = useState<"ALL" | "LOW">("ALL");
    const [priceFilter, setPriceFilter] = useState<"ALL" | "LOW">("ALL");

    const { data, isLoading, error } = useGetAllProducts({
        page,
        limit,
    });

    // Filter products based on search and filters
    const filteredProducts = data?.products?.filter((product: ProductInfo) => {
        // Search filter
        const matchesSearch =
            product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.name?.toLowerCase().includes(searchTerm.toLowerCase());

        // Type filter
        const matchesType = typeFilter === "ALL" || product.type === typeFilter;

        // Inventory filter (less than 20)
        const matchesInventory = inventoryFilter === "ALL" ||
            (inventoryFilter === "LOW" && product.inventory < 20);

        // Price filter (less than 50000 cents = $500)
        const matchesPrice = priceFilter === "ALL" ||
            (priceFilter === "LOW" && product.price < 50000);

        return matchesSearch && matchesType && matchesInventory && matchesPrice;
    }) || [];

    const TYPE_BADGE_COLORS: Record<ProductType, string> = {
        [ProductType.CURTAIN]: 'badge-primary',
        [ProductType.HARDWARE]: 'badge-secondary',
        [ProductType.PILLOW]: 'badge-accent',
    };

    const formatPrice = (cents: number) => {
        return `$${(cents / 100).toFixed(2)}`;
    };

    return (
        <div className="p-2 m-2 w-full">
            <div className="flex flex-row justify-between align-items-center">
                <p className="flex items-center text-2xl font-semibold">
                    <FaArchive className="mx-2"/>
                    <span>Product Management</span>
                </p>
                <div className="grid grid-cols-3 gap-2">
                    <label className="input col-span-2">
                        <CiSearch />
                        <input
                            type="search"
                            placeholder="Search by code or name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </label>
                    <Link className="btn btn-primary rounded-full" href={ADMIN_MANAGEMENTS.ADD_PRODUCT.VIEW}>
                        <IoAdd className="text-xl"/>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 my-3">
                <label className="form-control">
                    <div className="label">
                        <span className="label-text">Type</span>
                    </div>
                    <select
                        className="select select-bordered select-sm"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as ProductType | "ALL")}
                    >
                        <option value="ALL">All Types</option>
                        <option value={ProductType.CURTAIN}>Curtain</option>
                        <option value={ProductType.HARDWARE}>Hardware</option>
                        <option value={ProductType.PILLOW}>Pillow</option>
                    </select>
                </label>

                <label className="form-control">
                    <div className="label">
                        <span className="label-text">Inventory</span>
                    </div>
                    <select
                        className="select select-bordered select-sm"
                        value={inventoryFilter}
                        onChange={(e) => setInventoryFilter(e.target.value as "ALL" | "LOW")}
                    >
                        <option value="ALL">All Stock</option>
                        <option value="LOW">Low Stock (&lt; 20)</option>
                    </select>
                </label>

                <label className="form-control">
                    <div className="label">
                        <span className="label-text">Price</span>
                    </div>
                    <select
                        className="select select-bordered select-sm"
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value as "ALL" | "LOW")}
                    >
                        <option value="ALL">All Prices</option>
                        <option value="LOW">Budget (&lt; $500)</option>
                    </select>
                </label>

                {/* Clear Filters Button */}
                {(typeFilter !== "ALL" || inventoryFilter !== "ALL" || priceFilter !== "ALL" || searchTerm) && (
                    <button
                        className="btn btn-ghost btn-sm self-end"
                        onClick={() => {
                            setTypeFilter("ALL");
                            setInventoryFilter("ALL");
                            setPriceFilter("ALL");
                            setSearchTerm("");
                        }}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Results count */}
            {!isLoading && data && (
                <div className="text-sm text-base-content/70 mb-2">
                    Showing {filteredProducts.length} of {data.total} products
                    {data.totalPages > 1 && ` (Page ${data.page} of ${data.totalPages})`}
                </div>
            )}

            <div className="overflow-x-auto my-3 rounded-box border border-base-content/5 bg-base-100">
                <table className="table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Inventory</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading && (
                        <tr>
                            <td colSpan={7} className="text-center">
                                <span className="loading loading-spinner loading-md"></span>
                            </td>
                        </tr>
                    )}

                    {error && (
                        <tr>
                            <td colSpan={7} className="text-center text-error">
                                Failed to load products
                            </td>
                        </tr>
                    )}

                    {!isLoading && !error && filteredProducts.length === 0 && (
                        <tr>
                            <td colSpan={7} className="text-center">
                                No products found
                            </td>
                        </tr>
                    )}

                    {!isLoading && !error && filteredProducts.map((product: ProductInfo, index: number) => (
                        <tr key={product.id} className={`${product.isOutOfStock ? "bg-red-50" : ""}`}>
                            <th>{index + 1}</th>
                            <td>
                                <code className="text-xs">{product.code}</code>
                            </td>
                            <td>
                                <span className="font-medium">{product.name}</span>
                                {product.isOutOfStock && (
                                    <span className="badge badge-error badge-xs ml-2">Out of Stock</span>
                                )}
                            </td>
                            <td>
                                <span className={`badge ${TYPE_BADGE_COLORS[product.type]} badge-sm`}>
                                    {product.type}
                                </span>
                            </td>
                            <td className="font-mono">{formatPrice(product.price)}</td>
                            <td>
                                <span className={`${product.inventory < 20 ? "text-warning font-bold" : ""}`}>
                                    {product.inventory}
                                </span>
                            </td>
                            <td>
                                <Link
                                    href={`${ADMIN_MANAGEMENTS.PRODUCT_PROFILE.VIEW}${product.id}`}
                                    className="btn btn-ghost btn-sm"
                                >
                                    View
                                </Link>
                                <Link
                                    href={`${ADMIN_MANAGEMENTS.PRODUCT_PROFILE.VIEW}${product.id}`}
                                    className="btn btn-ghost btn-sm"
                                >
                                    Edit
                                </Link>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {!isLoading && data && (
                <Pagination
                    currentPage={page}
                    totalPages={data.totalPages}
                    onPageChange={setPage}
                />
            )}
        </div>
    );
}

export default Page;