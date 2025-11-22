import {useMutation, useQuery} from "@tanstack/react-query";
import axios from "axios";
import {ADMIN_MANAGEMENTS} from "@/app/Util/constants/paths";

export function useCreateProduct() {
    return useMutation({
        mutationFn: async (data: FormData)=> {
            const res = await axios.post(ADMIN_MANAGEMENTS.ADD_PRODUCT.API, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.status === 201) {
                return res.data;
            } else {
                throw new Error(res.statusText);
            }
        }
    })
}

export function useUpdateProduct(productId: string) {
    return useMutation({
        mutationFn: async (data: FormData) => {
            const res = await axios.patch(`${ADMIN_MANAGEMENTS.PRODUCT_PROFILE.API}${productId}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.status === 200) {
                return res.data;
            } else {
                throw new Error(res.statusText);
            }
        }
    });
}

export interface UseGetAllProductsParams {
    page?: number;
    limit?: number;
}

export function useGetProductById(productId: string) {
    return useQuery({
        queryKey: [GET_PRODUCT_BY_ID_QUERY_KEY + productId],
        queryFn: async (data) => {
            const res = await axios.get(ADMIN_MANAGEMENTS.PRODUCT_PROFILE.API + productId)
            return res.data;
        },
        enabled: !!productId, // Only fetch if productId exists
    })
}

export function useGetAllProducts(params: UseGetAllProductsParams = {}) {
    const page = params.page || 1;
    const limit = params.limit || 50;

    return useQuery({
        queryKey: [GET_ALL_PRODUCTS_QUERY_KEY, page, limit],
        queryFn: async() => {
            const res = await axios.get(ADMIN_MANAGEMENTS.PRODUCTS.API, {
                params: { page, limit }
            });
            return res.data;
        },
        staleTime: 1000 * 60 * 5,// cache for 5 minutes
    });
}

export const GET_ALL_PRODUCTS_QUERY_KEY = "products";
export const GET_PRODUCT_BY_ID_QUERY_KEY = "product-";