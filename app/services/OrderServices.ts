import {orderCreationSchema} from "@/app/busniessLogic/Order/orderValidation";
import {Credential} from "@/app/Util/constants/session";
import prisma from "@/prisma/client";
import {OrderStatus, PaymentStatus} from "@prisma/client";
import crypto from 'crypto';
import {z} from "zod";

export type OrderCreation = z.infer<typeof orderCreationSchema>;

/**
 * Generates a unique random alphanumeric order number
 * Format: ORD-A3F8K9L2 (8 random uppercase hex characters)
 * Example: ORD-4F2A8B1C, ORD-D9E7C3A5, etc.
 */
async function generateOrderNumber(): Promise<string> {
    let orderNumber: string;
    let isUnique = false;

    // Keep generating until we get a unique one (collision is extremely rare)
    while (!isUnique) {
        const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
        orderNumber = `ORD-${randomPart}`;

        // Check if this order number already exists
        const existingOrder = await prisma.order.findUnique({
            where: { orderNumber }
        });

        if (!existingOrder) {
            isUnique = true;
            return orderNumber;
        }
    }

    // This line will never be reached due to the while loop, but TypeScript needs it
    throw new Error('Failed to generate unique order number');
}

export async function createOrder(
    bean: OrderCreation,
    credential: Credential
) {
    const user = credential.getUser();
    const orderNumber = await generateOrderNumber();

    // Build the base order data
    const orderData: any = {
        orderNumber,

        // Pricing
        subtotal: bean.subtotal,
        shippingCost: bean.shippingCost,
        tax: bean.tax,
        discount: 0, // Can be extended later for discount codes
        totalAmount: bean.totalAmount,

        // Shipping
        isPickUp: bean.isPickUp,

        // Payment
        paymentMethod: bean.paymentMethod,
        paymentStatus: PaymentStatus.PENDING,

        // Order Status
        orderStatus: OrderStatus.PENDING,

        // Status history
        statusHistory: [
            {
                status: OrderStatus.PENDING,
                changedAt: new Date(),
                note: 'Order placed'
            }
        ],

        // Create order items
        items: {
            create: bean.items.map((item: any) => ({
                productId: item.productId,
                productName: item.productName,
                productCode: item.productCode,
                productImagePath: item.productImagePath,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                subtotal: item.subtotal,
            }))
        }
    };

    // Add optional fields conditionally
    if (user?.userId) {
        orderData.userId = user.userId;
        orderData.statusHistory[0].changedBy = {
            userId: user.userId,
            name: user.name,
            role: user.role
        };
    }

    if (bean.shippingAddress) {
        orderData.shippingAddress = bean.shippingAddress;
    }

    if (bean.customerNote) {
        orderData.customerNote = bean.customerNote;
    }

    // Add optional order item fields
    orderData.items.create = orderData.items.create.map((item: any, index: number) => {
        const sourceItem = bean.items[index];
        if (sourceItem.selectedColor) {
            item.selectedColor = sourceItem.selectedColor;
        }
        if (sourceItem.customization) {
            item.customization = sourceItem.customization;
        }
        return item;
    });

    // Create the order with all order items
    const order = await prisma.order.create({
        data: orderData,
        include: {
            items: true,
            user: true
        }
    });
    return order;
}

export async function getOrderById(id: string) {
    return prisma.order.findUnique({
        where: { id: id},
        include: {
            items: true,
            user: true
        }
    });
}

export async function getRecentMonthOrderByUserId(userId: string, credential: Credential) {
    const user = credential.getUser();

    // Authorization: Only the user themselves, ADMIN, or ROOT can access their orders
    const isOwnUser = user?.userId === userId;
    const isAdminOrRoot = user?.role === 'ADMIN' || user?.role === 'ROOT';

    if (!isOwnUser && !isAdminOrRoot) {
        throw new Error('Unauthorized: You can only access your own orders');
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return prisma.order.findMany({
        where: {
            userId: userId,
            createdAt: {
                gte: thirtyDaysAgo
            }
        },
        include: {
            items: true,
            user: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}