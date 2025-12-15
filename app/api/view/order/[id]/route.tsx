import {NextRequest, NextResponse} from "next/server";
import {getOrderById} from "@/app/services/OrderServices";

export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const orderMongoId = (await context.params).id;
    const order  = await getOrderById(orderMongoId)
    return NextResponse.json(order, {status: 200})
}
