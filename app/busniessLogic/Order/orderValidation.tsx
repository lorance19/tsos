import {z} from "zod";
import {addressSchema} from "@/app/busniessLogic/User/userValidation";
import {COUNTRY} from "@/app/Util/constants/country";


// Required address schema (for delivery)
const requiredAddressSchema = z.object({
    street1: z.string().min(1, "Street address is required"),
    street2: z.string().optional().nullable(),
    zip: z.string()
        .min(1, "Zip code is required")
        .refine((value) => /^\d{5}(-\d{4})?$/.test(value), 'Invalid zip code').optional(),
    city: z.string().min(1, "City is required"),
    country: z.enum(COUNTRY, {
        message: 'Country is required',
    })
});

// Shipping schema with conditional validation
export const shippingFieldsSchema = z.object({
    isPickUp: z.boolean(),
    address: addressSchema.optional().nullable(),
}).superRefine((data, ctx) => {
    // If not pickup (delivery), address is required
    if (!data.isPickUp) {
        const addressValidation = requiredAddressSchema.safeParse(data.address);

        if (!addressValidation.success) {
            /*
             When isPickUp = false, this code:
              1. Validates the address using requiredAddressSchema
              2. If validation fails, takes each error
              3. Adds 'address' prefix to the error path
              4. So form fields like address.city show the correct error
             */
            addressValidation.error.issues.forEach(issue => {
                ctx.addIssue({
                    code: 'custom',
                    message: issue.message,
                    path: ['address', ...issue.path],
                });
            });
        }
    }
    // If pickup is true, address can be null/optional (no validation needed)
});