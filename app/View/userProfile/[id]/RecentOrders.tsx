import React from 'react';
import { FaBox, FaCalendar, FaShoppingBag } from "react-icons/fa";
import Link from "next/link";
import { ORDER } from "@/app/Util/constants/paths";
import {
    formatCurrency,
    getOrderStatusColor,
    getPaymentStatusColor,
    formatDate,
    OrderWithDetails, formatStatus
} from "@/app/busniessLogic/Order/orderManager.ts";

interface RecentOrdersProps {
    orders: OrderWithDetails[];
    isLoading: boolean;
}

const RecentOrders: React.FC<RecentOrdersProps> = ({ orders, isLoading }) => {

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="text-center py-8">
                <FaShoppingBag className="mx-auto text-4xl text-base-content/30 mb-4" />
                <p className="text-base-content/60">No orders found in the past 30 days</p>
                <p className="text-sm text-base-content/40 mt-2">Your recent orders will appear here</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <Link
                    key={order.id}
                    href={ORDER(order.id).VIEW}
                    className="block"
                >
                    <div className="border border-base-300 rounded-lg p-4 hover:bg-base-200 transition-colors cursor-pointer">
                        {/* Order Header */}
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <FaBox className="text-primary" />
                                    <span className="font-semibold">{order.orderNumber}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-sm text-base-content/60">
                                    <FaCalendar className="text-xs" />
                                    <span>{formatDate(order.createdAt)}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-lg">{formatCurrency(order.totalAmount)}</div>
                                <div className="text-xs text-base-content/60">
                                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                </div>
                            </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="flex gap-2 mb-3 overflow-x-auto">
                            {order.items.slice(0, 3).map((item) => (
                                <div key={item.id} className="flex-shrink-0">
                                    <img
                                        src={item.productImagePath || '/placeholder.png'}
                                        alt={item.productName}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                </div>
                            ))}
                            {order.items.length > 3 && (
                                <div className="flex-shrink-0 w-16 h-16 bg-base-300 rounded flex items-center justify-center">
                                    <span className="text-xs text-base-content/60">
                                        +{order.items.length - 3}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-2">
                            <div className={`badge ${getOrderStatusColor(order.orderStatus)} badge-sm`}>
                                {formatStatus(order.orderStatus)}
                            </div>
                            <div className={`badge ${getPaymentStatusColor(order.paymentStatus)} badge-sm`}>
                                {formatStatus(order.paymentStatus)}
                            </div>
                            {order.isPickUp && (
                                <div className="badge badge-outline badge-sm">
                                    Pick Up
                                </div>
                            )}
                        </div>

                        {/* Shipping Info */}
                        {order.shippingAddress && !order.isPickUp && (
                            <div className="mt-2 text-xs text-base-content/60">
                                Ship to: {order.shippingAddress.recipientName}, {order.shippingAddress.city}
                            </div>
                        )}
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default RecentOrders;