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

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: 'newest' | 'price_low_high' | 'rating_high_low';
    filterType?: import("@prisma/client").ProductType | 'all';
}

export interface PaginatedProducts {
    products: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export async function getProductById(id: string) {
    return prisma.product.findUnique({
        where: {id : id}
    })
}

export async function getProductsViewList(params: PaginationParams = {}) : Promise<PaginatedProducts> {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;
    const sortBy = params.sortBy || 'newest';
    const filterType = params.filterType || 'all';

    // Build where clause with optional type filter
    const whereClause: any = {
        isOutOfStock: false,
        isDetailFilled: true
    };

    // Add type filter if not 'all'
    if (filterType !== 'all') {
        whereClause.type = filterType;
    }

    // Determine orderBy based on sortBy parameter
    let orderBy: any;
    switch (sortBy) {
        case 'price_low_high':
            orderBy = { price: 'asc' };
            break;
        case 'rating_high_low':
            orderBy = { rating: 'desc' };
            break;
        case 'newest':
        default:
            orderBy = { createdAt: 'desc' };
            break;
    }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                type: true,
                price: true,
                deals: true,
                rating: true,
                mainImagePath: true,
                imageColorInfo: true,
            },
            skip,
            take: limit,
            orderBy
        }),
        prisma.product.count({
            where: whereClause
        })
    ]);

    return {
        products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
}

export async function getProducts(params: PaginationParams = {}): Promise<PaginatedProducts> {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            select: {
                id: true,
                code: true,
                name: true,
                type: true,
                price: true,
                inventory: true,
                isOutOfStock: true
            },
            skip,
            take: limit,
            orderBy: {
                createdAt: 'desc'
            }
        }),
        prisma.product.count()
    ]);

    return {
        products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
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

export async function updateProduct(
    productId: string,
    bean: AddNewProductForm,
    mainImagePath: string,
    secondaryImagePaths: string[],
    credential: Credential
) {
    if (!credential.isAdmin() && !credential.isRoot()) {
        throw new ProductCreationError("authorization", "You are not authorized to update product");
    }

    const user = credential.requireAuth();

    try {
        return await prisma.product.update({
            where: { id: productId },
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
        console.error('Error updating product:', error);
        const errorMessage = error instanceof Error ? error.message : "Failed to update product";
        throw new ProductCreationError("database", `Failed to update product: ${errorMessage}`);
    }
}