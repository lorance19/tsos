import {NextRequest, NextResponse} from "next/server";
import {getRecentMonthOrderByUserId} from "@/app/services/OrderServices";
import {Credential} from "@/app/Util/constants/session";

export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ userId: string }> }
) {

    const userId = (await context.params).userId;
    const cred = await Credential.init();

    // Check if user is authenticated
    if (!cred || !cred.getUser()) {
        return NextResponse.json(
            { error: "Unauthorized: Please login" },
            { status: 401 }
        );
    }

    try {
        // Authorization is handled in the service function
        const orders = await getRecentMonthOrderByUserId(userId, cred);
        return NextResponse.json(orders, { status: 200 });
    } catch (error) {
        // Handle authorization errors
        const errorMessage = (error as Error).message;
        if (errorMessage.includes('Unauthorized')) {
            return NextResponse.json(
                { error: errorMessage },
                { status: 403 }
            );
        }

        // Handle other errors
        return NextResponse.json(
            { error: errorMessage },
            { status: 400 }
        );
    }
}
