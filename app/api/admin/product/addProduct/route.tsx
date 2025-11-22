import {NextRequest, NextResponse} from "next/server";
import {addNewProductSchema} from "@/app/busniessLogic/Product/productValidation";
import {createProduct} from "@/app/services/ProductService";
import {Credential} from "@/app/Util/constants/session";
import {
    handleProductError,
    parseProductFormData,
    rollbackImages,
    saveProductImages
} from "@/app/api/admin/product/productRouteHelpers";

export async function POST(request: NextRequest) {
    let savedImagePaths: string[] = [];

    try {
        // Check authentication
        const credential = await Credential.init();
        if (!credential.isLoggedIn()) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Parse FormData
        const formData = await request.formData();
        const data = parseProductFormData(formData);

        // Validate with Zod
        const validatedData = addNewProductSchema.parse(data);

        // Save images
        const { mainImagePath, secondaryImagePaths } = await saveProductImages(
            validatedData,
            savedImagePaths
        );

        console.log('Main image path:', mainImagePath);
        console.log('Secondary image paths:', secondaryImagePaths);

        // Create product in database
        try {
            const newProduct = await createProduct(
                validatedData,
                mainImagePath,
                secondaryImagePaths,
                credential
            );

            return NextResponse.json(
                {
                    success: true,
                    message: "Product created successfully",
                    data: newProduct
                },
                { status: 201 }
            );
        } catch (productError) {
            // Product creation failed - rollback images
            console.error('Product creation failed, rolling back images:', productError);
            rollbackImages(savedImagePaths);
            throw productError;
        }
    } catch (error) {
        return handleProductError(error);
    }
}