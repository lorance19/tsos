'use client'
import React from 'react';
import Link from 'next/link';
import { useGetAllProductsForView } from "@/app/busniessLogic/Product/productManager";
import { PRODUCT } from "@/app/Util/constants/paths";
import { FaHome, FaCouch, FaTools, FaArrowRight, FaStar } from 'react-icons/fa';
import { ProductType } from '@prisma/client';

function HomePage() {
    // Fetch latest products for featured section
    const { data: featuredProducts, isLoading } = useGetAllProductsForView({
        page: 1,
        limit: 6,
        sortBy: 'newest'
    });

    const formatCurrency = (amount: number) => {
        return `$${(amount / 100).toFixed(2)}`;
    };

    const categories = [
        {
            type: ProductType.CURTAIN,
            title: 'Curtains',
            description: 'Elegant curtains to transform your space',
            icon: FaHome,
            color: 'from-blue-500 to-blue-600',
            image: '/images/HomePage/category/curtainCategory.jpg'
        },
        {
            type: ProductType.PILLOW,
            title: 'Pillow Cases',
            description: 'Comfortable and stylish pillow cases',
            icon: FaCouch,
            color: 'from-purple-500 to-purple-600',
            image: '/images/HomePage/category/pillowCaseCategory.webp'
        },
        {
            type: ProductType.HARDWARE,
            title: 'Hardware',
            description: 'Quality hardware for all your needs',
            icon: FaTools,
            color: 'from-orange-500 to-orange-600',
            image: '/images/HomePage/category/hardwareCategory.jpg'
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div
                className="hero min-h-[500px] relative overflow-hidden"
                style={{
                    backgroundImage: "url('/images/HomePage/wallpaper.jpeg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="hero-content text-center text-white z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 font-montserrat">
                            Transform Your Space
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-white/90">
                            Discover our collection of premium curtains, pillow cases, and hardware
                        </p>
                        <Link href={PRODUCT.LIST.VIEW} className="btn btn-lg bg-white text-primary
                        hover:text-white hover:bg-secondary border-none">
                            Shop Now
                            <FaArrowRight className="ml-2" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Category Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold font-montserrat mb-4">Shop by Category</h2>
                    <p className="text-lg text-base-content/70">Find exactly what you need for your home</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <Link
                                key={category.type}
                                href={`${PRODUCT.LIST.VIEW}?filterType=${category.type.toLowerCase()}`}
                                className="group"
                            >
                                <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-md group-hover:scale-105 overflow-hidden">
                                    {category.image ? (
                                        <div
                                            className="h-64 flex items-center justify-center relative overflow-hidden"
                                            style={{
                                                backgroundImage: `url('${category.image}')`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
                                            <h3 className="text-white text-3xl font-bold font-montserrat z-10 group-hover:scale-110 transition-transform">
                                                {category.title}
                                            </h3>
                                        </div>
                                    ) : (
                                        <div className={`h-64 bg-gradient-to-br ${category.color} flex items-center justify-center relative overflow-hidden`}>
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                                            <Icon className="text-white text-6xl z-10 group-hover:scale-110 transition-transform" />
                                        </div>
                                    )}
                                    <div className="card-body">
                                        <h3 className="card-title text-2xl font-montserrat justify-center">
                                            {category.title}
                                        </h3>
                                        <p className="text-center text-base-content/70">{category.description}</p>
                                        <div className="card-actions justify-center mt-4">
                                            <button className="btn btn-primary btn-sm group-hover:btn-secondary group-hover:text-white">
                                                Browse {category.title}
                                                <FaArrowRight className="ml-1" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Featured Products Section */}
            <div className="bg-base-200 py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold font-montserrat mb-4">Featured Products</h2>
                        <p className="text-lg text-base-content/70">Check out our latest and most popular items</p>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <span className="loading loading-spinner loading-lg"></span>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {featuredProducts?.products?.slice(0, 6).map((product: any) => (
                                    <Link
                                        key={product.id}
                                        href={PRODUCT.STANDALONE(product.id).VIEW}
                                        className="group"
                                    >
                                        <div className="card bg-base-100 shadow-lg hover:shadow-xl rounded-md transition-all duration-300">
                                            <figure className="relative h-64 overflow-hidden">
                                                <img
                                                    src={product.mainImagePath || '/placeholder.png'}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                {product.badges && product.badges.length > 0 && (
                                                    <div className="absolute top-2 left-2 flex gap-2">
                                                        {product.badges.map((badge: string, index: number) => (
                                                            <div key={index} className="badge badge-secondary badge-lg">
                                                                {badge}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {product.salePrice && (
                                                    <div className="absolute top-2 right-2 bg-error text-white px-3 py-1 rounded-full font-bold">
                                                        {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                                                    </div>
                                                )}
                                            </figure>
                                            <div className="card-body">
                                                <h3 className="card-title text-lg line-clamp-2">{product.name}</h3>
                                                {product.rating && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <FaStar className="text-warning" />
                                                        <span className="font-semibold">{product.rating.toFixed(1)}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 mt-2">
                                                    {product.salePrice ? (
                                                        <>
                                                            <span className="text-xl font-bold text-error">
                                                                {formatCurrency(product.salePrice)}
                                                            </span>
                                                            <span className="text-sm line-through text-base-content/60">
                                                                {formatCurrency(product.price)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-xl font-bold">
                                                            {formatCurrency(product.price)}
                                                        </span>
                                                    )}
                                                </div>
                                                {product.isOutOfStock && (
                                                    <div className="badge badge-error mt-2">Out of Stock</div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {featuredProducts?.products?.length > 0 && (
                                <div className="text-center mt-12">
                                    <Link href={PRODUCT.LIST.VIEW} className="btn btn-primary btn-lg">
                                        View All Products
                                        <FaArrowRight className="ml-2" />
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Promotional Banner */}
            <div className="bg-gradient-to-r from-accent to-secondary py-16">
                <div className="container mx-auto px-4 text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 font-montserrat">
                        Quality Home Decor Solutions
                    </h2>
                    <p className="text-lg md:text-xl mb-6 text-white/90">
                        Premium materials, expert craftsmanship, and unbeatable prices
                    </p>
                    <div className="flex flex-wrap justify-center gap-8 mt-8">
                        <div className="flex flex-col items-center">
                            <div className="text-4xl font-bold">100+</div>
                            <div className="text-white/80">Products</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-4xl font-bold">5★</div>
                            <div className="text-white/80">Rated</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-4xl font-bold">24/7</div>
                            <div className="text-white/80">Support</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;