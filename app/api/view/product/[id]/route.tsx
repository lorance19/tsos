import {NextRequest, NextResponse} from "next/server";
import {Credential} from "@/app/Util/constants/session";
import {getProductById} from "@/app/services/ProductService";
import {handleGetProductById} from "@/app/services/routeHandler/productRouteHandler";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {

    const productMongoId = (await context.params).id;
    if (!productMongoId) {
        return NextResponse.json(
            { error: "MongoId is missing" },
            { status: 403 }
        );
    }

    return await handleGetProductById(productMongoId);
}