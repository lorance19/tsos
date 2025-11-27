import {NextRequest, NextResponse} from "next/server";
import {getProductsViewList} from "@/app/services/ProductService";
import {ProductType} from "@prisma/client";

export async function GET(request: NextRequest) {
    try {

        // Get pagination params from URL
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const sortBy = searchParams.get('sortBy') || 'newest';
        const filterType = searchParams.get('filterType') || 'all';

        // Validate params
        if (page < 1 || limit < 1 || limit > 100) {
            return NextResponse.json(
                { error: "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100" },
                { status: 400 }
            );
        }

        // Validate sortBy
        const validSortOptions = ['newest', 'price_low_high', 'rating_high_low'];
        if (!validSortOptions.includes(sortBy)) {
            return NextResponse.json(
                { error: "Invalid sort option" },
                { status: 400 }
            );
        }

        // Validate filterType
        const validFilterTypes = ['all', ...Object.values(ProductType)];
        if (!validFilterTypes.includes(filterType as any)) {
            return NextResponse.json(
                { error: "Invalid filter type" },
                { status: 400 }
            );
        }

        const result = await getProductsViewList({
            page,
            limit,
            sortBy: sortBy as 'newest' | 'price_low_high' | 'rating_high_low',
            filterType: filterType as ProductType | 'all'
        });
        return NextResponse.json(result, {status: 200});
    } catch(error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }

}