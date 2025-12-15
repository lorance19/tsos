import {useMutation, useQuery} from "@tanstack/react-query";
import {orderCreationSchema} from "@/app/busniessLogic/Order/orderValidation";
import {z} from "zod";
import axios from "axios";
import {ORDER, PRODUCT} from "@/app/Util/constants/paths";
import {GET_PRODUCT_BY_ID_QUERY_KEY} from "@/app/busniessLogic/Product/productManager";
import {Order, OrderItem, User} from "@prisma/client";

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

export const GET_ORDER_BY_ID_QUERY_KEY =  (orderId: string) => (`products-${orderId}`);
