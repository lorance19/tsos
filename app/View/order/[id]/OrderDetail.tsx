'use client'
import React from 'react';
import {useParams} from "next/navigation";
import {
    formatCurrency, formatStatus,
    getOrderStatusColor,
    getPaymentStatusColor,
    useGetOrderById,
    formatDate
} from "@/app/busniessLogic/Order/orderManager.ts";
import {
    FaBox,
    FaCalendar,
    FaCheckCircle,
    FaClock,
    FaCreditCard,
    FaMapMarkerAlt,
    FaShippingFast,
    FaTruck,
    FaUser
} from "react-icons/fa";
import Unexpected from "@/app/View/unexpectedError/page";
import {AxiosError} from "axios";
import Link from "next/link";
import {ADMIN_MANAGEMENTS, USER_PROFILE} from "@/app/Util/constants/paths";
import {useAuth} from "@/app/auth/context";

function OrderDetail() {
    const params = useParams();
    const {user} = useAuth();
    const orderId = params.id as string;

    const {data: order, isLoading, error} = useGetOrderById(orderId);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error) {
        return <Unexpected axiosError={error as AxiosError}/>;
    }

    if (!order) {
        return (
            <div className="container mx-auto p-4">
                <div className="alert alert-error">
                    <span>Order not found</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mx-auto p-2 max-w-6xl card bg-base-100 rounded-lg m-3 shadow-lg">
                <div className="card-body">
                    <div className="breadcrumbs text-sm p-3">
                        <ul>
                            <li>
                                <Link className="link-primary" href={USER_PROFILE(user!.userId).VIEW}>
                                    My profile
                                </Link>
                            </li>
                            <li>Order Detail</li>
                        </ul>
                    </div>
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex justify-between items-start bg-orange-50 p-3 rounded-sm">
                            <div>
                                <h1 className="text-3xl font-bold font-montserrat mb-2">Order Details</h1>
                                <div className="flex items-center gap-2">
                                    <FaBox className="text-primary"/>
                                    <span className="text-xl font-semibold">{order.orderNumber}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                                <div className={`badge ${getOrderStatusColor(order.orderStatus)} badge-lg`}>
                                    {formatStatus(order.orderStatus)}
                                </div>
                                <div className={`badge ${getPaymentStatusColor(order.paymentStatus)} badge-lg`}>
                                    Payment: {formatStatus(order.paymentStatus)}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-base-content/60 mt-2">
                            <FaCalendar className="text-sm"/>
                            <span>Placed on {formatDate(order.createdAt)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content - Order Items */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Items */}
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title text-xl font-montserrat mb-4">Order Items</h2>
                                    <div className="space-y-4">
                                        {order.items.map((item) => (
                                            <div key={item.id}
                                                 className="flex gap-4 p-4 border border-base-300 rounded-lg hover:bg-base-200 transition-colors">
                                                <img
                                                    src={item.productImagePath || '/placeholder.png'}
                                                    alt={item.productName}
                                                    className="w-24 h-24 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg">{item.productName}</h3>
                                                    <p className="text-sm text-base-content/60">Code: {item.productCode}</p>
                                                    {item.selectedColor && (
                                                        <p className="text-sm text-base-content/60">Color: {item.selectedColor}</p>
                                                    )}
                                                    {item.customization && (
                                                        <p className="text-sm text-base-content/60">Customization: {item.customization}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="text-sm">Qty: {item.quantity}</span>
                                                        <span className="text-sm">Unit Price: {formatCurrency(item.unitPrice)}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-lg">{formatCurrency(item.subtotal)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Information */}
                            {order.shippingAddress && !order.isPickUp && (
                                <div className="card bg-base-100 shadow-xl">
                                    <div className="card-body">
                                        <h2 className="card-title text-xl font-montserrat mb-4">
                                            <FaMapMarkerAlt className="text-primary"/>
                                            Shipping Address
                                        </h2>
                                        <div className="space-y-2">
                                            <p className="font-semibold">{order.shippingAddress.recipientName}</p>
                                            <p>{order.shippingAddress.phone}</p>
                                            <p>{order.shippingAddress.street1}</p>
                                            {order.shippingAddress.street2 && <p>{order.shippingAddress.street2}</p>}
                                            <p>{order.shippingAddress.city}, {order.shippingAddress.zip}</p>
                                            {order.trackingNumber && (
                                                <div className="mt-4 p-3 bg-base-200 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <FaTruck className="text-primary"/>
                                                        <span className="text-sm font-semibold">Tracking Number:</span>
                                                    </div>
                                                    <p className="font-mono mt-1">{order.trackingNumber}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {order.isPickUp && (
                                <div className="card bg-base-100 shadow-xl">
                                    <div className="card-body">
                                        <h2 className="card-title text-xl font-montserrat mb-4">
                                            <FaShippingFast className="text-primary"/>
                                            Pick Up Order
                                        </h2>
                                        <div className="alert alert-info">
                                            <span>This order is marked for pick-up at the store</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Customer Note */}
                            {order.customerNote && (
                                <div className="card bg-base-100 shadow-xl">
                                    <div className="card-body">
                                        <h2 className="card-title text-xl font-montserrat mb-4">Customer Note</h2>
                                        <p className="text-base-content/80">{order.customerNote}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title text-xl font-montserrat mb-4">Order Summary</h2>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-base-content/60">Subtotal</span>
                                            <span>{formatCurrency(order.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-base-content/60">Shipping</span>
                                            <span>{formatCurrency(order.shippingCost)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-base-content/60">Tax</span>
                                            <span>{formatCurrency(order.tax)}</span>
                                        </div>
                                        {order.discount > 0 && (
                                            <div className="flex justify-between text-success">
                                                <span>Discount</span>
                                                <span>-{formatCurrency(order.discount)}</span>
                                            </div>
                                        )}
                                        <div className="divider my-2"></div>
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span>{formatCurrency(order.totalAmount)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title text-xl font-montserrat mb-4">
                                        <FaCreditCard className="text-primary"/>
                                        Payment
                                    </h2>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-base-content/60">Method</span>
                                            <span className="font-semibold">{formatStatus(order.paymentMethod)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-base-content/60">Status</span>
                                            <span className={`badge ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                {formatStatus(order.paymentStatus)}
                                            </span>
                                        </div>
                                        {order.paidAt && (
                                            <div className="flex justify-between">
                                                <span className="text-base-content/60">Paid At</span>
                                                <span className="text-sm">{formatDate(order.paidAt)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Customer Information */}
                            {order.user && (
                                <div className="card bg-base-100 shadow-xl">
                                    <div className="card-body">
                                        <h2 className="card-title text-xl font-montserrat mb-4">
                                            <FaUser className="text-primary"/>
                                            Customer
                                        </h2>
                                        <div className="space-y-2">
                                            <p className="font-semibold">{order.user.firstName} {order.user.lastName}</p>
                                            <p className="text-sm text-base-content/60">{order.user.email}</p>
                                            {order.user.phone && (
                                                <p className="text-sm text-base-content/60">{order.user.phone}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Status History */}
                            {order.statusHistory && order.statusHistory.length > 0 && (
                                <div className="card bg-base-100 shadow-xl">
                                    <div className="card-body">
                                        <h2 className="card-title text-xl font-montserrat mb-4">
                                            <FaClock className="text-primary"/>
                                            Status History
                                        </h2>
                                        <div className="space-y-3">
                                            {order.statusHistory.map((history: any, index: number) => (
                                                <div key={index} className="flex gap-3">
                                                    <div className="flex flex-col items-center">
                                                        <FaCheckCircle className="text-success"/>
                                                        {index < order.statusHistory.length - 1 && (
                                                            <div className="w-0.5 h-full bg-base-300 mt-1"></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 pb-4">
                                                        <p className="font-semibold">{formatStatus(history.status)}</p>
                                                        <p className="text-xs text-base-content/60">
                                                            {formatDate(history.changedAt)}
                                                        </p>
                                                        {history.note && (
                                                            <p className="text-sm text-base-content/70 mt-1">{history.note}</p>
                                                        )}
                                                        {history.changedBy && (
                                                            <p className="text-xs text-base-content/50 mt-1">
                                                                by {history.changedBy.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default OrderDetail;