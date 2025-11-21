// Image set schema with proper file validation
import {z} from "zod";
import {$Enums, Color} from "@prisma/client";
import ProductType = $Enums.ProductType;
import Deals = $Enums.Deals;


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

// Base schema for common product detail fields
const baseProductDetailSchema = z.object({
    name: z.string().min(1, {message: "Product name is required"}),
    inventory: z.number({
        message: "Please enter a valid number for inventory"
    }).min(0, {message: "Inventory must be 0 or greater"}),
    type: z.enum(ProductType, { message: "Please select a valid product type" }),
    deal: z.enum(Deals).optional(),
    price: z.number({
        message: "Please enter a valid number for price"
    }).min(0, {message:"Price must be 0 or greater"}),
});

export const addNewProductSchema = baseProductDetailSchema.extend({
    code: z.string().min(1, {message: "Code is required"}),
    detailDescription: z.string().min(1, "Detail description is required").max(1000, "Description too long"),
    careDescription: z.string().min(0, "Care description is required").max(500, "Care description too long"),
    note: z.string().optional(),
    isCustomizable: z.boolean(),
    imageValidation: imageSetSchema
})
