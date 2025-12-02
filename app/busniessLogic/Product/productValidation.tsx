// Image set schema with proper file validation
import {z} from "zod";
import {$Enums, Color} from "@prisma/client";
import ProductType = $Enums.ProductType;
import Badge = $Enums.Badge;


// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// File validation helper
const fileValidator = z.any()
    .refine((file) => file instanceof File, {
        message: "Please upload a valid file"
    })
    .refine((file) => file instanceof File && file.size > 0, {
        message: "File must not be empty"
    })
    .refine((file) => file instanceof File && file.size <= MAX_FILE_SIZE, {
        message: "File size must be less than 5MB"
    })
    .refine((file) => file instanceof File && ALLOWED_IMAGE_TYPES.includes(file.type), {
        message: "Only JPEG, PNG, WebP, and GIF images are allowed"
    });

const imageSetSchema = z.object({
    mainImage: z.any().optional(),
    secondaryImages: z.any().optional()
});

// Base schema for common product detail fields (without refinement to allow extending)
const baseProductDetailFieldsSchema = z.object({
    name: z.string().min(1, {message: "Product name is required"}),
    inventory: z.number({
        message: "Please enter a valid number for inventory"
    }).min(0, {message: "Inventory must be 0 or greater"}),
    type: z.enum(ProductType, { message: "Please select a valid product type" }),
    price: z.number({
        message: "Please enter a valid number for price"
    }).min(0, {message:"Price must be 0 or greater"}),
    salePrice: z.number({
        message: "Please enter a valid number for sale price"
    }).min(0, {message:"Sale price must be 0 or greater"}).optional(),
    badges: z.array(z.enum(Badge)).optional(),
    saleEndDate: z.date().optional(),
});

// Refinement function to check sale price is less than regular price
const salePriceRefinement = (data: any) => {
    // If salePrice is set, it must be less than regular price
    if (data.salePrice && data.salePrice >= data.price) {
        return false;
    }
    return true;
};

export const addNewProductSchema = baseProductDetailFieldsSchema.extend({
    code: z.string().min(1, {message: "Code is required"}),
    detailDescription: z.string().min(1, "Detail description is required").max(1000, "Description too long"),
    careDescription: z.string().min(0, "Care description is required").max(500, "Care description too long"),
    note: z.string().optional(),
    isCustomizable: z.boolean(),
    imageValidation: imageSetSchema
}).refine(salePriceRefinement, {
    message: "Sale price must be less than regular price",
    path: ["salePrice"]
})
