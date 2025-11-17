import {Credential} from "@/app/Util/constants/session";
import {addNewProductSchema} from "@/app/busniessLogic/Product/productValidation";
import {z} from "zod";

export type AddNewProductForm = z.infer<typeof addNewProductSchema>;

export class ProductCreationError extends Error {
    constructor(public field: string, message: string) {
        super(message);
        this.name = 'ProductCreationError';
    }
}

export async function createProduct(bean: AddNewProductForm, credential : Credential) {
    if (!credential.isAdmin() && !credential.isAdmin()) {
        throw new Error("You are not authorized to create product");
    }

    const mainImage = bean.imageValidation.mainImage;
    const secondaryImages = bean.imageValidation.secondaryImages;




}