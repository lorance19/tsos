'use client'
import React from 'react';
import {useParams} from "next/navigation";
import {IoIosCheckmarkCircleOutline} from "react-icons/io";
import Link from "next/link";
import {USER_PROFILE} from "@/app/Util/constants/paths";
import {useAuth} from "@/app/auth/context";
import {useGetOrderById} from "@/app/busniessLogic/Order/orderManager.ts";

function SuccessOrder() {
    const params = useParams();
    const orderId = params.id as string;
    const {user} = useAuth();

    const {data: order, isLoading} = useGetOrderById(orderId);

    if (isLoading) {
        return (
            <div className="flex p-10 justify-center w-full bg-yellow-100">
                <div className="flex flex-col justify-center items-center">
                    <span className="loading loading-spinner loading-lg"></span>
                    <p className="mt-4">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex p-10 justify-center w-full bg-yellow-100">
                <div className="flex flex-col justify-center items-center">
                    <p className="text-2xl font-semibold text-error">Order not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex p-10 justify-center w-full bg-orange-100">
            <div className="flex flex-col justify-center items-center">
                <IoIosCheckmarkCircleOutline className="text-success text-6xl"/>
                <p className="text-3xl p-5 font-semibold text-secondary-content">Thank you for your order!</p>
                <div className="text-2xl">Order Number: <span className="font-semibold text-secondary-content">{order.orderNumber}</span></div>

                {user && <p className= "text-lg p-5 font-montserrat text-yellow-800">
                    You can also view/track your orders in your <Link className="text-gray-800 hover:text-orange-400 hover:underline" href={USER_PROFILE(user.userId).VIEW}>profile</Link> page.
                </p>
                }
            </div>
        </div>
    );
}

export default SuccessOrder;