import { symbolValidation } from "@/lib/backend/validations/miscValidations";
import { requestWrapper } from "../requestWrapper";
import { getMarkPrice } from "@/lib/backend/utils";

export const GET = requestWrapper(async (req: Request)=>{

        console.log("reached here..")
    
        const {searchParams} = new URL(req.url);
        const params = {
            symbol: searchParams.get("symbol")
        }
    
        const {assetId} = symbolValidation.parse(params);
        
        const markPrice = getMarkPrice(assetId);
        
    return new Response(JSON.stringify({markPrice}), {
        status: 200,
        headers: {
            "content-type": "application/json"
        }
    })
})