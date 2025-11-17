import {NextRequest} from "next/server";
import {parseRequestBodyZod} from "@/app/Util/zodUtil";
import {addNewProductSchema} from "@/app/busniessLogic/Product/productValidation";

export async function POST(request: NextRequest) {
    try {
        const body = await parseRequestBodyZod(request, addNewProductSchema)
    } catch (error) {
        console.log(error);
    }
}