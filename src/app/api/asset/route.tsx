import { symbolValidation } from "@/lib/backend/validations/miscValidations";
import { requestWrapper } from "../requestWrapper";

export const GET = requestWrapper(async (req: Request)=>{
    const {searchParams} = new URL(req.url)
    const params = {
        symbol: searchParams.get("symbol"),
    };
    const { asset } = symbolValidation.parse(params);
    return new Response(JSON.stringify(asset), {
        status: 200,
        headers: {
            "content-type": "application/json"
        }
    })
})