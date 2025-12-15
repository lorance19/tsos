import {NextRequest, NextResponse} from "next/server";
import {Credential} from "@/app/Util/constants/session";
import {parseRequestBodyZod} from "@/app/Util/zodUtil";
import {orderCreationSchema} from "@/app/busniessLogic/Order/orderValidation";
import {createOrder} from "@/app/services/OrderServices";

export async function POST(request: NextRequest) {
    try {
        const credential = await Credential.init();
        const body = await parseRequestBodyZod(request, orderCreationSchema);

        // Create the order
        const order = await createOrder(body, credential);

        // Return the created order with order number
        return NextResponse.json({
            success: true,
            message: 'Order placed successfully',
            orderNumber: order.orderNumber,
            orderId: order.id,
            order: order
        }, { status: 201 });

    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Failed to create order'
        }, { status: 400 });
    }
}