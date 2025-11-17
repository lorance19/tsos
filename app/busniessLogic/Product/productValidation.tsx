// Image set schema with proper file validation
import {z} from "zod";
import {$Enums, Color} from "@prisma/client";
import ProductType = $Enums.ProductType;
import Deals = $Enums.Deals;


// File validation helper
const fileValidator = z.any().refine(
    (file) => file instanceof File && file.size > 0,
    { message: "File is required and must not be empty" }
);

const imageSetSchema = z.object({
    mainImage: z.instanceof(File, { message: "Main image is required" }),
    color: z.enum(Color, { message: "Please select a valid color" }),
    secondaryImages: z.array(fileValidator).optional()
});

// Base schema for common product detail fields
const baseProductDetailSchema = z.object({
    name: z.string(),
    inventory: z.number().min(0),
    type: z.enum(ProductType, { message: "Please select a valid product type" }),
    deal: z.enum(Deals).optional(),
    price: z.number().min(0),
});

export const addNewProductSchema = baseProductDetailSchema.extend({
    code: z.string().min(0, {message: "Code is required"}),
    detailDescription: z.string().min(1, "Detail description is required").max(1000, "Description too long"),
    careDescription: z.string().min(0, "Care description is required").max(500, "Care description too long"),
    note: z.string().optional(),
    isCustomizable: z.boolean(),
    imageValidation: imageSetSchema
})
