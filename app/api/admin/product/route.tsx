import {NextRequest, NextResponse} from "next/server";

import {getProducts} from "@/app/services/ProductService";

export async function GET(request: NextRequest) {
    try {
        // Get pagination params from URL
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '50', 10);

        // Validate params
        if (page < 1 || limit < 1 || limit > 100) {
            return NextResponse.json(
                { error: "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100" },
                { status: 400 }
            );
        }

        const result = await getProducts({ page, limit });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}