import {z} from "zod";
import {addressSchema, emailAndPhoneValidation} from "@/app/busniessLogic/User/userValidation";
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
    personalInfo: emailAndPhoneValidation.extend({
        name: z.string().min(1, 'Name is required'),
    }),
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

// Shipping address schema
const shippingAddressSchema = z.object({
    recipientName: z.string().min(1, 'Recipient name is required'),
    phone: z.string().min(1, 'Phone is required'),
    street1: z.string().min(1, 'Street address is required'),
    street2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    zip: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
});

// Order item schema
const orderItemSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    productName: z.string().min(1, 'Product name is required'),
    productCode: z.string(),
    productImagePath: z.string().min(1, 'Product image is required'),
    selectedColor: z.string().nullable().optional(),
    unitPrice: z.number().min(0, 'Unit price must be positive'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    subtotal: z.number().min(0, 'Subtotal must be positive'),
    customization: z.string().nullable().optional(),
});

// Complete order creation schema
export const orderCreationSchema = z.object({
    isPickUp: z.boolean(),
    shippingAddress: shippingAddressSchema.optional().nullable(),
    paymentMethod: z.nativeEnum(PaymentMethod),
    items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
    subtotal: z.number().min(0, 'Subtotal must be positive'),
    shippingCost: z.number().min(0, 'Shipping cost must be positive'),
    tax: z.number().min(0, 'Tax must be positive'),
    totalAmount: z.number().min(0, 'Total amount must be positive'),
    customerNote: z.string().optional(),
}).superRefine((data, ctx) => {
    // If not pickup, shipping address is required
    if (!data.isPickUp && !data.shippingAddress) {
        ctx.addIssue({
            code: 'custom',
            message: 'Shipping address is required for delivery',
            path: ['shippingAddress'],
        });
    }
});