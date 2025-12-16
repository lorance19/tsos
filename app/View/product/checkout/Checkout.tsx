'use client'
import React, {useEffect} from 'react';
import {orderValidation, orderCreationSchema} from "@/app/busniessLogic/Order/orderValidation";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {ShippingInformation} from './ShippingInformation';
import {BillingInformation} from './BillingInformation';
import {useCartContext, getEffectivePrice} from "@/app/View/product/CartContext";
import {OrderSummary} from './OrderSummary';
import Link from "next/link";
import {LOGIN_URL, ORDER, ORDER_SUCCESS, PRODUCT} from "@/app/Util/constants/paths";
import {useAuth} from "@/app/auth/context";
import {useGetUserById} from "@/app/busniessLogic/User/userManager";
import {useSubmitOrder} from "@/app/busniessLogic/Order/orderManager.ts";
import {useRouter} from "next/navigation";
import UnexpectedError from "@/app/View/Component/UnexpectedError";
import SuccessToast from "@/app/View/Component/SuccessToast";
import {useToastNotifications} from "@/app/Util/toast";

type ShippingForm = z.infer<typeof orderValidation>;
type OrderCreationPayload = z.infer<typeof orderCreationSchema>;



function Checkout() {
    const {user} = useAuth();
    const {cart, clearCart} = useCartContext();
    const router = useRouter();
    const submitOrderMutation = useSubmitOrder();
    const { error, toastMessage, showError, showSuccess } = useToastNotifications();

    // Fetch full user data if logged in
    const {data: userData} = useGetUserById(user?.userId || '');

    const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<ShippingForm>({
        resolver: zodResolver(orderValidation),
    });

    // Populate form with user data when available
    useEffect(() => {
        if (userData) {
            const fullName = [userData.firstName, userData.lastName].filter(Boolean).join(' ');

            reset({
                personalInfo: {
                    name: fullName || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                },
                address: userData.address ? {
                    street1: userData.address.street1 || '',
                    street2: userData.address.street2 || '',
                    city: userData.address.city || '',
                    zip: userData.address.zip || '',
                    country: userData.address.country || '',
                } : undefined,
                isPickUp: false,
            }, { keepDefaultValues: false });
        }
    }, [userData, reset]);

    const selectedPaymentMethod = watch('paymentMethod.method');

    // Transform cart items to OrderItem format
    const transformCartToOrderItems = () => {
        return cart.map(item => {
            const unitPrice = getEffectivePrice(item);
            const subtotal = unitPrice * item.quantity;

            return {
                productId: item.id,
                productName: item.name,
                productCode: '', // ProductViewInfo doesn't include code, backend should fetch from Product
                productImagePath: item.mainImagePath,
                selectedColor: null, // Can be extended later if color selection is implemented
                unitPrice,
                quantity: item.quantity,
                subtotal,
                customization: null, // Can be extended later for customizable products
            };
        });
    };

    // Handle order submission
    const onSubmit = handleSubmit(async (formData) => {
        try {
            // Transform cart items to OrderItem format
            const orderItems = transformCartToOrderItems();

            // Calculate order totals
            const subtotal = cart.reduce((total, item) => {
                return total + (getEffectivePrice(item) * item.quantity);
            }, 0);
            const shippingCost = 0; // Free shipping for now
            const tax = Math.round(subtotal * 0.1); // 10% tax
            const totalAmount = subtotal + shippingCost + tax;

            // Prepare order payload
            const orderPayload: OrderCreationPayload = {
                // Shipping and personal info from form
                isPickUp: formData.isPickUp,
                shippingAddress: !formData.isPickUp && formData.address ? {
                    recipientName: formData.personalInfo.name,
                    phone: formData.personalInfo.phone,
                    street1: formData.address.street1 || '',
                    street2: formData.address.street2 || '',
                    city: formData.address.city || '',
                    zip: formData.address.zip || '',
                    country: formData.address.country || '',
                } : undefined,

                // Payment info
                paymentMethod: formData.paymentMethod.method,

                // Order items from cart
                items: orderItems,

                // Pricing
                subtotal,
                shippingCost,
                tax,
                totalAmount,
                customerNote: '',
            };

            // Submit order to backend
            const response = await submitOrderMutation.mutateAsync(orderPayload);

            if (response.success) {
                // Clear cart and redirect to success page
                clearCart();
                showSuccess(`Order placed successfully! Order number: ${response.orderNumber}`);
                router.push(ORDER_SUCCESS(response.orderId).VIEW);
            }
        } catch (error) {
            showError("Oops. Something went wrong!");;
        }
    });

    return (
        <>
            <UnexpectedError errorMessage={error} />
            {toastMessage && <SuccessToast toastMessage={toastMessage} />}
            <form onSubmit={onSubmit} className="p-2 m-2 flex flex-col lg:flex-row gap-2 lg:h-[40rem]">
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
                        <button
                            type="submit"
                            disabled={submitOrderMutation.isPending}
                            className="btn btn-primary w-full lg:w-auto lg:px-12"
                        >
                            {submitOrderMutation.isPending ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Processing...
                                </>
                            ) : (
                                'Submit Order'
                            )}
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
        </>
    );
}

export default Checkout;