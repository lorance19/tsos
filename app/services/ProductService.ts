import {Credential} from "@/app/Util/constants/session";
import {addNewProductSchema} from "@/app/busniessLogic/Product/productValidation";
import {z} from "zod";
import prisma from "@/prisma/client";

export type AddNewProductForm = z.infer<typeof addNewProductSchema>;

export class ProductCreationError extends Error {
    constructor(public field: string, message: string) {
        super(message);
        this.name = 'ProductCreationError';
    }
}

export async function createProduct(
    bean: AddNewProductForm,
    mainImagePath: string,
    secondaryImagePaths: string[],
    credential: Credential
) {
    if (!credential.isAdmin() && !credential.isRoot()) {
        throw new ProductCreationError("authorization", "You are not authorized to create product");
    }

    const user = credential.requireAuth();

    try {
        return await prisma.product.create({
            data: {
                name: bean.name,
                type: bean.type,
                price: bean.price,
                code: bean.code,
                inventory: bean.inventory,
                isCustomizable: bean.isCustomizable,
                detailDescription: bean.detailDescription,
                careDescription: bean.careDescription,
                mainImagePath: mainImagePath,
                imageColorInfo: [
                    {
                        mainImagePath: mainImagePath,
                        secondaryImagesPaths: secondaryImagePaths
                    }
                ],
                deals: bean.deal ? [bean.deal] : [],
                isDetailFilled: true,
                isOutOfStock: bean.inventory === 0,
                createdBy: {
                    userId: user.userId,
                    name: user.name,
                    role: user.role
                },
                note: bean.note ? {
                    note: bean.note,
                    createdBy: {
                        userId: user.userId,
                        name: user.name,
                        role: user.role
                    }
                } : undefined
            }
        });
    } catch (error) {
        console.error('Error creating product:', error);
        const errorMessage = error instanceof Error ? error.message : "Failed to create product";
        throw new ProductCreationError("database", `Failed to create product: ${errorMessage}`);
    }
}