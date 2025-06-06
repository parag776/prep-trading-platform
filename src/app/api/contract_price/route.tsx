import { symbolValidation } from "@/lib/backend/validations/miscValidations";
import { requestWrapper } from "../requestWrapper";
import { latestCandles } from "@/lib/backend/store";
import { Resolution } from "@/generated/prisma";

const GET = requestWrapper(async (req: Request)=>{
    const {searchParams} = new URL(req.url);
    const params = {
        symbol: searchParams.get("symbol")
    }

    const {assetId} = symbolValidation.parse(params);

    const contractPrice = latestCandles.get({assetId, resolution: Resolution.ONE_MINUTE})?.close

    return new Response(JSON.stringify({contractPrice}), {
        status: 200,
        headers: {
            "content-type": "application/json"
        }
    })

})