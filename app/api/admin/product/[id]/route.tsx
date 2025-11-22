import {NextRequest, NextResponse} from "next/server";
import {Credential} from "@/app/Util/constants/session";
import {getProductById, ProductCreationError, updateProduct} from "@/app/services/ProductService";
import {addNewProductSchema} from "@/app/busniessLogic/Product/productValidation";
import {deleteImages, saveImage} from "@/app/services/FileServices";
import {ZodError} from "zod";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const cred = await Credential.init();

    const productMongoId = (await context.params).id;
    if (!productMongoId) {
        return NextResponse.json(
            { error: "MongoId is missing" },
            { status: 403 }
        );
    }
    if (!cred.isRootOrAdmin() || !cred.isLoggedIn()) {
        throw new Error("Access denied");
    }

    try {
        const product = await getProductById(productMongoId);
        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                {status: 404}
            );
        }
        return NextResponse.json(product, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            {error: (error as Error).message},
            {status: 403}
        );
    }
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const cred = await Credential.init();

    const productMongoId = (await context.params).id;
    if (!productMongoId) {
        return NextResponse.json(
            { error: "MongoId is missing" },
            { status: 403 }
        );
    }
    if (!cred.isRootOrAdmin() || !cred.isLoggedIn()) {
        throw new Error("Access denied");
    }

    let savedImagePaths: string[] = [];
    try {
        // Get existing product
        const existingProduct = await getProductById(productMongoId);
        if (!existingProduct) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Parse FormData
        const formData = await request.formData();
        const data: any = {};

        // Extract regular fields
        for (const [key, value] of formData.entries()) {
            if (!key.startsWith('imageValidation.')) {
                if (key === 'price' || key === 'inventory') {
                    data[key] = parseFloat(value as string);
                } else if (key === 'isCustomizable') {
                    data[key] = value === 'true';
                } else {
                    data[key] = value;
                }
            }
        }

        // Extract images
        const mainImage = formData.get('imageValidation.mainImage') as File | null;
        const secondaryImages = formData.getAll('imageValidation.secondaryImages') as File[];

        // Build imageValidation object
        data.imageValidation = {
            mainImage: mainImage,
            secondaryImages: secondaryImages.filter(img => img.size > 0)
        };

        // Validate with Zod
        const validatedData = addNewProductSchema.parse(data);

        // Handle images - keep existing if no new ones provided
        let mainImagePath = existingProduct.mainImagePath;
        let secondaryImagePaths = existingProduct.imageColorInfo?.[0]?.secondaryImagesPaths || [];

        // Update main image if new one provided
        if (mainImage && mainImage.size > 0) {
            const newMainImagePath = await saveImage(
                mainImage,
                validatedData.code + "/main",
                "mainImage"
            );
            savedImagePaths.push(newMainImagePath);
            mainImagePath = newMainImagePath;
        }

        // Update secondary images if new ones provided
        if (data.imageValidation.secondaryImages.length > 0) {
            const newSecondaryImagePaths = await Promise.all(
                data.imageValidation.secondaryImages.map((image: File, index: number) =>
                    saveImage(image, validatedData.code + "/secondary", `${index + 1}`)
                )
            );
            savedImagePaths.push(...newSecondaryImagePaths);
            secondaryImagePaths = newSecondaryImagePaths;
        }

        // Update product in database
        try {
            const updatedProduct = await updateProduct(
                productMongoId,
                validatedData,
                mainImagePath,
                secondaryImagePaths,
                cred
            );

            return NextResponse.json(
                {
                    success: true,
                    message: "Product updated successfully",
                    data: updatedProduct
                },
                { status: 200 }
            );
        } catch (productError) {
            // Product update failed - rollback by deleting newly saved images
            console.error('Product update failed, rolling back images:', productError);
            if (savedImagePaths.length > 0) {
                try {
                    deleteImages(savedImagePaths);
                } catch (deleteError) {
                    console.error('Failed to delete images during rollback:', deleteError);
                }
            }
            throw productError;
        }
    } catch (error) {
        console.error('Error updating product:', error);

        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: "Validation failed", issues: error.issues },
                { status: 400 }
            );
        }

        if (error instanceof ProductCreationError) {
            return NextResponse.json(
                { error: error.message, field: error.field },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: (error as Error).message || "Failed to update product" },
            { status: 400 }
        );
    }
}