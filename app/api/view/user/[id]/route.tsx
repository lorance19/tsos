import {NextRequest} from "next/server";
import {handleGetUserById} from "@/app/services/routeHandler/userRouteHandler";

export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    return handleGetUserById(context);
}
