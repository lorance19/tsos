'use client';

import {ProductViewInfo} from "@/app/View/product/ProductList";
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";

interface CartItem extends ProductViewInfo {
    quantity: number;
}

// Helper function to get effective price (sale price if active, otherwise regular price)
export function getEffectivePrice(item: ProductViewInfo): number {
    if (!item.salePrice) return item.price;

    // Check if sale has an end date and if it's expired
    if (item.saleEndDate) {
        const saleEndDate = new Date(item.saleEndDate);
        if (saleEndDate <= new Date()) {
            return item.price; // Sale expired, use regular price
        }
    }

    // Sale is active (no end date or end date is in the future)
    return item.salePrice;
}

interface CartContextType {
    cart: CartItem[];
    isCartOpen: boolean;
    toggleCart: () => void;
    addToCart: (product: ProductViewInfo) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, delta: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);


export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from LocalStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('shopping-cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to LocalStorage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('shopping-cart', JSON.stringify(cart));
        }
    }, [cart, isLoaded]);

    const addToCart = useCallback((product: ProductViewInfo) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                // If exists, increment quantity
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            // If new, add with quantity 1
            setIsCartOpen(true); // Open cart to give feedback
            return [...prev, { ...product, quantity: 1 }];
        });
    }, []);

    const removeFromCart = useCallback((productId: string) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    }, []);

    const updateQuantity = useCallback((productId: string, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === productId) {
                    const newQuantity = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const toggleCart = useCallback(() => setIsCartOpen(!isCartOpen), [isCartOpen]);

    // Derived State
    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => total + getEffectivePrice(item) * item.quantity, 0);
    }, [cart]);

    const cartCount = useMemo(() => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    }, [cart]);

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        cart,
        isCartOpen,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
    }), [cart, isCartOpen, toggleCart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount]);

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};

export function useCartContext() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
}