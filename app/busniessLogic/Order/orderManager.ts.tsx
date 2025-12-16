import {useMutation, useQuery} from "@tanstack/react-query";
import {orderCreationSchema} from "@/app/busniessLogic/Order/orderValidation";
import {z} from "zod";
import axios from "axios";
import {ORDER, ORDER_BY_USER_ID, PRODUCT} from "@/app/Util/constants/paths";
import {GET_PRODUCT_BY_ID_QUERY_KEY} from "@/app/busniessLogic/Product/productManager";
import {Order, OrderItem, OrderStatus, PaymentStatus, User} from "@prisma/client";

type OrderCreationPayload = z.infer<typeof orderCreationSchema>;

// Type for order with relations (matches the API response)
export type OrderWithDetails = Order & {
    items: OrderItem[];
    user: User | null;
};

export function useSubmitOrder() {
    return useMutation({
        mutationFn: async (data: OrderCreationPayload) => {
            const res = await axios.post(PRODUCT.CHECK_OUT.API, data);
            if (res.status === 200 || res.status === 201) {
                return res.data;
            } else {
                throw new Error(res.statusText);
            }
        }
    })
}

export function useGetOrderById(orderId: string) {
    return useQuery<OrderWithDetails>({
        queryKey: [GET_ORDER_BY_ID_QUERY_KEY(orderId)],
        queryFn: async () => {
            const res = await axios.get<OrderWithDetails>(ORDER(orderId).API);
            return res.data;
        },
        enabled: !!orderId
    })
}

export function useGetOrdersByUserId(userId: string) {
    return useQuery<OrderWithDetails[]>({
        queryKey: [GET_ORDERS_BY_USER_ID_QUERY_KEY(userId)],
        queryFn: async () => {
            const res = await axios.get<OrderWithDetails[]>(ORDER_BY_USER_ID(userId).API);
            return res.data;
        },
        enabled: !!userId
    })
}

export const getPaymentStatusColor = (status: PaymentStatus) => {
    const statusColors = {
        PENDING: 'badge-warning',
        COMPLETED: 'badge-success',
        FAILED: 'badge-error',
        REFUNDED: 'badge-error'
    };
    return statusColors[status] || 'badge-ghost';
};

export const formatDate = (date: string | Date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
});

export const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

export const getOrderStatusColor = (status: OrderStatus) => {
    const statusColors = {
        PENDING: 'badge-warning',
        PAYMENT_CONFIRMED: 'badge-info',
        PROCESSING: 'badge-info',
        SHIPPED: 'badge-primary',
        DELIVERED: 'badge-success',
        CANCELLED: 'badge-error',
        REFUNDED: 'badge-error'
    };
    return statusColors[status] || 'badge-ghost';
};

export const formatCurrency = (amount: number) => {
    return `$${(amount).toFixed(2)}`;
};

export const GET_ORDER_BY_ID_QUERY_KEY =  (orderId: string) => (`order-${orderId}`);
export const GET_ORDERS_BY_USER_ID_QUERY_KEY =  (orderId: string) => (`orders-by-user-${orderId}`);
