import {NextRequest, NextResponse} from "next/server";
import {addNewProductSchema} from "@/app/busniessLogic/Product/productValidation";
import {deleteImages, saveImage} from "@/app/services/FileServices";
import {createProduct, ProductCreationError} from "@/app/services/ProductService";
import {Credential} from "@/app/Util/constants/session";
import {ZodError} from "zod";

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
        // Parse multipart form data
        const formData = await request.formData();

        // Convert FormData to object
        const data: any = {};

        formData.forEach((value, key) => {
            // Handle nested objects (e.g., "imageValidation.mainImage")
            if (key.includes('.')) {
                const keys = key.split('.');
                let current = data;

                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) {
                        current[keys[i]] = {};
                    }
                    current = current[keys[i]];
                }

                // Handle arrays for nested keys (e.g., multiple secondaryImages)
                const finalKey = keys[keys.length - 1];
                if (current[finalKey] !== undefined) {
                    // Key already exists - convert to array or append to array
                    if (Array.isArray(current[finalKey])) {
                        current[finalKey].push(value);
                    } else {
                        current[finalKey] = [current[finalKey], value];
                    }
                } else {
                    current[finalKey] = value;
                }
            } else {
                // Handle arrays for non-nested keys
                if (data[key]) {
                    if (Array.isArray(data[key])) {
                        data[key].push(value);
                    } else {
                        data[key] = [data[key], value];
                    }
                } else {
                    data[key] = value;
                }
            }
        });

        // Convert string numbers to actual numbers
        if (data.price) data.price = parseFloat(data.price as string);
        if (data.inventory) data.inventory = parseInt(data.inventory as string);
        if (data.isCustomizable) data.isCustomizable = data.isCustomizable === 'true';

        // Ensure imageValidation object exists
        if (!data.imageValidation) {
            data.imageValidation = {};
        }

        // Handle file uploads
        if (data.imageValidation.mainImage instanceof File) {
            console.log('Main image:', data.imageValidation.mainImage.name);
        }
        if (data.imageValidation.secondaryImages) {
            const secondaryImages = Array.isArray(data.imageValidation.secondaryImages)
                ? data.imageValidation.secondaryImages
                : [data.imageValidation.secondaryImages];
            console.log('Secondary images:', secondaryImages.map((f: File) => f.name));
        }


        // Validate with Zod
        const validatedData = addNewProductSchema.parse(data);

        // Step 1: Save images (can throw FileUploadError)
        const mainImagePath = await saveImage(
            validatedData.imageValidation.mainImage as File,
            validatedData.code + "/main",
            "mainImage"
        );
        savedImagePaths.push(mainImagePath);

        // Save all secondary images
        const secondaryImages = Array.isArray(validatedData.imageValidation.secondaryImages)
            ? validatedData.imageValidation.secondaryImages
            : [validatedData.imageValidation.secondaryImages];

        const secondaryImagePaths = await Promise.all(
            secondaryImages.map((image, index) =>
                saveImage(image as File, validatedData.code + "/secondary", `${index + 1}`)
            )
        );
        savedImagePaths.push(...secondaryImagePaths);

        console.log('Main image path:', mainImagePath);
        console.log('Secondary image paths:', secondaryImagePaths);

        // Step 2: Create product in database (can throw ProductCreationError)
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
            // Product creation failed - rollback by deleting saved images
            console.error('Product creation failed, rolling back images:', productError);
            try {
                deleteImages(savedImagePaths);
                console.log('Successfully deleted uploaded images after product creation failure');
            } catch (deleteError) {
                console.error('Failed to delete images during rollback:', deleteError);
            }

            // Re-throw to be handled by outer catch
            throw productError;
        }
    } catch (error) {
        console.error('Error creating product:', error);

        // Handle different error types
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    issues: error.issues
                },
                { status: 400 }
            );
        }

        if (error instanceof ProductCreationError) {
            return NextResponse.json(
                {
                    error: error.message,
                    field: error.field
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: (error as Error).message || "Failed to create product" },
            { status: 400 }
        );
    }
}