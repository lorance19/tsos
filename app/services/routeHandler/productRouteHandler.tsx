import {NextResponse} from "next/server";
import {getProductById} from "@/app/services/ProductService";

export async function handleGetProductById(productId: string) {
    try {
        const product = await getProductById(productId);
        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                {status: 404}
            );
        }
        return NextResponse.json(product, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            {error: (error as Error).message},
            {status: 403}
        );
    }
}