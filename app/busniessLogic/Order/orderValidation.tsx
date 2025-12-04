import {z} from "zod";
import {addressSchema} from "@/app/busniessLogic/User/userValidation";
import {PaymentMethod} from "@prisma/client";

// Card details schema (for credit/debit cards)
const cardDetailsSchema = z.object({
    cardNumber: z.string()
        .min(1, "Card number is required")
        .regex(/^\d{13,19}$/, "Card number must be 13-19 digits"),
    cardholderName: z.string().min(1, "Cardholder name is required"),
    expiryDate: z.string()
        .min(1, "Expiry date is required")
        .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Format: MM/YY"),
    cvv: z.string()
        .min(3, "CVV must be 3-4 digits")
        .max(4, "CVV must be 3-4 digits")
        .regex(/^\d{3,4}$/, "CVV must be digits only"),
});

const paymentValidationSchema = z.object({
    method: z.enum(PaymentMethod, { message: "Please select the payment method" }),
    // Optional card details (required only for card payments)
    cardNumber: z.string().optional(),
    cardholderName: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),
    // Optional PayPal email
    paypalEmail: z.string().optional(),
}).superRefine((data, ctx) => {
    // If payment method is credit or debit card, validate card details
    if (data.method === 'CREDIT_CARD' || data.method === 'DEBIT_CARD') {
        const cardValidation = cardDetailsSchema.safeParse({
            cardNumber: data.cardNumber,
            cardholderName: data.cardholderName,
            expiryDate: data.expiryDate,
            cvv: data.cvv,
        });

        if (!cardValidation.success) {
            cardValidation.error.issues.forEach(issue => {
                ctx.addIssue({
                    code: 'custom',
                    message: issue.message,
                    path: issue.path,
                });
            });
        }
    }

    // If PayPal, email is required and must be valid
    if (data.method === 'PAYPAL') {
        if (!data.paypalEmail || data.paypalEmail === '') {
            ctx.addIssue({
                code: 'custom',
                message: "PayPal email is required",
                path: ['paypalEmail'],
            });
        } else {
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.paypalEmail)) {
                ctx.addIssue({
                    code: 'custom',
                    message: "Invalid email format",
                    path: ['paypalEmail'],
                });
            }
        }
    }
});

// Shipping schema with conditional validation
export const orderValidation = z.object({
    isPickUp: z.boolean(),
    address: addressSchema.optional().nullable(),
    paymentMethod: paymentValidationSchema
}).superRefine((data, ctx) => {
    // If not pickup (delivery), address is required
    if (!data.isPickUp) {
        const addressValidation = addressSchema.safeParse(data.address);

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