'use client';

import React from 'react';
import {getEffectivePrice, useCartContext} from "@/app/View/product/CartContext";
import {FiShoppingCart} from "react-icons/fi";
import {IoClose} from "react-icons/io5";
import {LuMinus, LuPlus, LuTrash} from "react-icons/lu";
import {calculateDiscountPercent, isSaleActive} from "@/app/busniessLogic/Product/productManager";
import Link from "next/link";
import {PRODUCT} from "@/app/Util/constants/paths";

function CartSideBar() {
    const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity, cartTotal } = useCartContext();

    return (
        <div className={`fixed inset-0 z-50 overflow-hidden transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black transition-opacity duration-300 ${isCartOpen ? 'opacity-60' : 'opacity-0'}`}
                onClick={toggleCart}
            />

            <div className="absolute inset-y-0 right-0 max-w-md w-full flex">
                <div className={`h-full w-full bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-6 border-b border-primary">
                        <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
                        <button
                            onClick={toggleCart}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <IoClose className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                                <FiShoppingCart className="h-12 w-12 opacity-20" />
                                <p>Your cart is empty</p>
                                <button
                                    onClick={toggleCart}
                                    className="text-secondary font-medium hover:underline"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            <ul className="space-y-6">
                                {cart.map((item) => {
                                    const onSale = item.salePrice && isSaleActive(item.saleEndDate);
                                    const displayPrice = onSale ? item.salePrice! : item.price;
                                    const discountPercent = onSale ? calculateDiscountPercent(item.price, item.salePrice) : 0;

                                    return (
                                        <li key={item.id} className="flex py-2 animate-in fade-in slide-in-from-right-4">
                                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                            <img
                                                src={item.mainImagePath}
                                                alt={item.name}
                                                className="h-full w-full object-cover object-center"
                                            />
                                        </div>

                                        <div className="ml-4 flex flex-1 flex-col">
                                            <div>
                                                <div className="flex justify-between text-base font-medium text-gray-900 ">
                                                    <h3 className="line-clamp-2 pr-4">{item.name}</h3>
                                                    <p className={`ml-4 ${onSale ? "text-error" : ""}`}>
                                                        ${ onSale ? ((item.salePrice! * item.quantity).toFixed(2)) : (item.price * item.quantity).toFixed(2)}<br/>
                                                        {onSale && <small className="text-danger italic">{discountPercent}% OFF</small>}
                                                    </p>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">{item.type}</p>
                                            </div>
                                            <div className="flex flex-1 items-end justify-between text-sm">

                                                {/* Quantity Controls */}
                                                <div className="flex items-center border rounded-lg">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                        className="p-1 px-2 hover:bg-gray-100 disabled:opacity-50"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <LuMinus className="w-3 h-3" />
                                                    </button>
                                                    <span className="px-2 font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                        className="p-1 px-2 hover:bg-gray-100"
                                                    >
                                                        <LuPlus className="w-3 h-3" />
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="font-medium text-red-600 hover:text-red-500 flex items-center gap-1"
                                                >
                                                    <LuTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                    )
                                })}
                            </ul>
                        )}
                    </div>

                    {/* Footer / Checkout */}
                    {cart.length > 0 && (
                        <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                            <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                                <p>Subtotal</p>
                                <p>${cartTotal.toFixed(2)}</p>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-500 mb-6">
                                Shipping and taxes calculated at checkout.
                            </p>
                            <Link
                                href={PRODUCT.CHECK_OUT.VIEW}
                                className="btn btn-primary"
                                onClick={toggleCart}
                            >
                                Checkout
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CartSideBar;