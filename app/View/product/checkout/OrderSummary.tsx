'use client'
import React from 'react';
import {useCartContext, getEffectivePrice} from "@/app/View/product/CartContext";
import Image from "next/image";
import {TAX} from "@/app/Util/constants/constants";

export function OrderSummary() {
    const {cart, cartTotal} = useCartContext();

    // Calculate shipping and tax (you can make these dynamic later)
    const shippingCost = cart.length > 0 ? 0 : 0; // Free shipping for now
    const tax = Math.round(cartTotal * TAX); // 10% tax
    const totalAmount = cartTotal + shippingCost + tax;

    if (cart.length === 0) {
        return (
            <div className="card bg-base-100 shadow-sm p-6">
                <p className="text-xl font-montserrat mb-4">Order Summary</p>
                <div className="text-center text-gray-500 py-8">
                    Your cart is empty
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-base-100 shadow-sm p-6 flex flex-col h-full">
            {/* Header - Fixed */}
            <p className="text-2xl font-montserrat mb-4 flex-shrink-0">Order Summary</p>

            {/* Cart Items List - Scrollable */}
            <div className="flex-1 overflow-y-auto mb-6 pr-2 -mr-2">
                <div className="space-y-4">
                    {cart.map((item) => {
                        const unitPrice = getEffectivePrice(item);
                        const itemSubtotal = unitPrice * item.quantity;

                        return (
                            <div key={item.id} className="flex gap-3 border-b pb-4">
                                {/* Product Image */}
                                <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden">
                                    <Image
                                        src={item.mainImagePath}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Product Details */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-sm truncate">
                                        {item.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Qty: {item.quantity}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-sm font-semibold ${item.salePrice && item.salePrice < item.price  ? "text-error" : ""}`}>
                                            ${unitPrice.toFixed(2)}
                                        </span>
                                        {item.salePrice && item.salePrice < item.price && (
                                            <span className="text-xs text-gray-400 line-through">
                                                ${item.price.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Item Subtotal */}
                                <div className="text-right flex-shrink-0">
                                    <p className="font-semibold text-sm">
                                        ${itemSubtotal.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Price Breakdown - Fixed at Bottom */}
            <div className="space-y-2 pt-4 flex-shrink-0 bg-yellow-50 p-1">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${cartTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                        {shippingCost === 0 ? 'FREE' : `$${shippingCost}`}
                    </span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                </div>

                {/* Total */}
                <div className="flex justify-between text-lg font-bold border-t pt-3 mt-3">
                    <span>Total</span>
                    <span className="text-primary">${totalAmount.toFixed(2)}</span>
                </div>
            </div>

            {/* Item Count - Fixed at Bottom */}
            <div className="mt-4 text-center text-sm text-gray-500 flex-shrink-0">
                {cart.reduce((count, item) => count + item.quantity, 0)} item(s) in cart
            </div>
        </div>
    );
}