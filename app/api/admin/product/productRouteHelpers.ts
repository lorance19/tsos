import {NextResponse} from "next/server";
import {ZodError} from "zod";
import {ProductCreationError} from "@/app/services/ProductService";
import {deleteImages, saveImage} from "@/app/services/FileServices";
import {AddNewProductForm} from "@/app/services/ProductService";

/**
 * Parse FormData into a product data object
 * Handles nested keys and type conversions
 */
export function parseProductFormData(formData: FormData): any {
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

    // Convert string values to appropriate types
    if (data.price) data.price = parseFloat(data.price as string);
    if (data.inventory) data.inventory = parseInt(data.inventory as string);
    if (data.isCustomizable) data.isCustomizable = data.isCustomizable === 'true';

    if (data.salePrice) data.salePrice = parseFloat(data.salePrice as string);

    // Handle badges array - ensure it's an array or undefined
    if (data.badges) {
        // If it's not already an array, make it one
        if (!Array.isArray(data.badges)) {
            data.badges = [data.badges];
        }
    } else {
        data.badges = undefined;
    }

    // Handle optional saleEndDate - convert to Date or undefined
    if (data.saleEndDate && data.saleEndDate !== '') {
        data.saleEndDate = new Date(data.saleEndDate as string);
    } else {
        data.saleEndDate = undefined;
    }

    // Ensure imageValidation object exists
    if (!data.imageValidation) {
        data.imageValidation = {};
    }

    return data;
}

/**
 * Save product images and track paths for potential rollback
 */
export async function saveProductImages(
    validatedData: AddNewProductForm,
    savedImagePaths: string[]
): Promise<{ mainImagePath: string; secondaryImagePaths: string[] }> {
    // Save main image
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

    return { mainImagePath, secondaryImagePaths };
}

/**
 * Rollback images if database operation fails
 */
export function rollbackImages(savedImagePaths: string[]): void {
    if (savedImagePaths.length > 0) {
        try {
            deleteImages(savedImagePaths);
            console.log('Successfully deleted uploaded images after operation failure');
        } catch (deleteError) {
            console.error('Failed to delete images during rollback:', deleteError);
        }
    }
}

/**
 * Handle product operation errors and return appropriate response
 */
export function handleProductError(error: unknown): NextResponse {
    console.error('Error in product operation:', error);

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
        { error: (error as Error).message || "Operation failed" },
        { status: 400 }
    );
}