import {NextRequest, NextResponse} from "next/server";
import {Credential} from "@/app/Util/constants/session";
import {getProductById, updateProduct} from "@/app/services/ProductService";
import {addNewProductSchema} from "@/app/busniessLogic/Product/productValidation";
import {saveImage} from "@/app/services/FileServices";
import {handleProductError, parseProductFormData, rollbackImages} from "@/app/api/admin/product/productRouteHelpers";

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
        const data = parseProductFormData(formData);

        // Validate with Zod
        const validatedData = addNewProductSchema.parse(data);

        // Handle images - keep existing if no new ones provided
        let mainImagePath = existingProduct.mainImagePath;
        let secondaryImagePaths = existingProduct.imageColorInfo?.[0]?.secondaryImagesPaths || [];


        // Update main image if new one provided
        if (validatedData.imageValidation?.mainImage && (validatedData.imageValidation.mainImage as File).size > 0) {
            const newMainImagePath = await saveImage(
                validatedData.imageValidation.mainImage as File,
                validatedData.code + "/main",
                "mainImage"
            );
            savedImagePaths.push(newMainImagePath);
            mainImagePath = newMainImagePath;
        }

        // Update secondary images if new ones provided
        // Normalize to array (parseProductFormData returns single File if only one uploaded)
        const rawSecondaryImages = data.imageValidation.secondaryImages;
        const secondaryImagesArray = rawSecondaryImages
            ? (Array.isArray(rawSecondaryImages) ? rawSecondaryImages : [rawSecondaryImages])
            : [];

        if (secondaryImagesArray.length > 0) {
            const newSecondaryImagePaths = await Promise.all(
                secondaryImagesArray.map((image: File, index: number) =>
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
            // Product update failed - rollback images
            console.error('Product update failed, rolling back images:', productError);
            rollbackImages(savedImagePaths);
            throw productError;
        }
    } catch (error) {
        return handleProductError(error);
    }
}