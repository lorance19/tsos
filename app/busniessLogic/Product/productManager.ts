import {useMutation} from "@tanstack/react-query";
import axios from "axios";
import {ADMIN_MANAGEMENTS} from "@/app/Util/constants/paths";
import {AddNewProductForm} from "@/app/services/ProductService";

export function useCreateProduct() {
    return useMutation({
        mutationFn: async (data: AddNewProductForm)=> {
            const res = await axios.post(ADMIN_MANAGEMENTS.ADD_PRODUCT.API, data);
            if (res.status === 201) {
                return res.data;
            } else {
                throw new Error(res.statusText);
            }
        }
    })
}