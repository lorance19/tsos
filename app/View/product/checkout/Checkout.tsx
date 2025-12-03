'use client'
import React, {useState} from 'react';
import {shippingFieldsSchema} from "@/app/busniessLogic/Order/orderValidation";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {userLoginValidationSchema} from "@/app/busniessLogic/User/userValidation";
import {LoginForm} from "@/app/View/login/page";

type ShippingForm = z.infer<typeof shippingFieldsSchema>;

enum Status {
    SHIPPING, BILLING
}

function Checkout() {
    const [currentStep, setCurrentStep] = useState(Status.SHIPPING);

    const { register, handleSubmit, formState: { errors } } = useForm<ShippingForm>({
        resolver: zodResolver(shippingFieldsSchema),
    });


    return (
        <form className="w-full p-2 m-2 flex flex-row">
            <div className="w-2/3 p-2 card bg-base-100 shadow-sm m-1">
                <div className="breadcrumbs text-sm">
                    <ul>
                        <li>Cart</li>
                        <li className={`${currentStep === Status.SHIPPING ? "text-primary underline" : ""} `}>Shipping</li>
                        <li className={`${currentStep === Status.BILLING ? "text-primary underline" : ""} `}>Billing</li>
                    </ul>
                </div>

                {currentStep === Status.SHIPPING && (
                    <div className="py-2">
                        <p className="text-2xl "> Shipping Information</p>
                    </div>
                )}

            </div>
            <div className="w-1/3">
                Order Summary
            </div>

        </form>
    );
}

export default Checkout;