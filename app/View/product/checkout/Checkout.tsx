'use client'
import React from 'react';
import {orderValidation} from "@/app/busniessLogic/Order/orderValidation";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {ShippingInformation} from './ShippingInformation';
import {BillingInformation} from './BillingInformation';
import {useCartContext} from "@/app/View/product/CartContext";
import {OrderSummary} from './OrderSummary';
import Link from "next/link";
import {LOGIN_URL, PRODUCT} from "@/app/Util/constants/paths";
import {useAuth} from "@/app/auth/context";
import {Role} from "@prisma/client";

type ShippingForm = z.infer<typeof orderValidation>;



function Checkout() {

    const { register, handleSubmit, formState: { errors }, watch } = useForm<ShippingForm>({
        resolver: zodResolver(orderValidation),
    });
    const {user} = useAuth();
    const {cart} = useCartContext();

    const selectedPaymentMethod = watch('paymentMethod.method');

    return (
        <form className="p-2 m-2 flex flex-col lg:flex-row gap-2 lg:h-[40rem]">
            <div className="w-full lg:w-2/3 p-2 card bg-base-100 shadow-sm flex flex-col">
                <div className="breadcrumbs text-sm">
                    <ul>
                        <li>Cart</li>
                        <li className="text-primary underline">Shipping & Billing</li>
                    </ul>
                </div>

                <div className="p-3 flex-1">
                    <ShippingInformation register={register} errors={errors} />
                    <BillingInformation
                        register={register}
                        errors={errors}
                        selectedPaymentMethod={selectedPaymentMethod}
                    />
                    <div className="flex flex-col items-center gap-3 mt-4">
                        <button type="submit" className="btn btn-primary w-full lg:w-auto lg:px-12">
                            Submit Order
                        </button>
                        {!user && (
                            <Link
                                href={`${LOGIN_URL}?redirect=${encodeURIComponent(PRODUCT.CHECK_OUT.VIEW)}`}
                                className="text-md text-primary hover:underline text-center"
                            >
                                Login to unlock hidden deals?
                            </Link>
                        )}
                    </div>

                </div>
            </div>
            <div className="w-full lg:w-1/3 flex">
                <OrderSummary />
            </div>
        </form>
    );
}

export default Checkout;