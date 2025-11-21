import {useMutation} from "@tanstack/react-query";
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

export const GET_ALL_PRODUCTS_QUERY_KEY = "products";
export const GET_PRODUCT_BY_ID_QUERY_KEY = "product-";