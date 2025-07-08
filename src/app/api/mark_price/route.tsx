import { symbolValidation } from "@/lib/backend/validations/miscValidations";
import { requestWrapper } from "../requestWrapper";
import { getMarkPrice } from "@/lib/backend/store/priceStore";

export const GET = requestWrapper(async (req: Request)=>{

    
        const {searchParams} = new URL(req.url);
        const params = {
            symbol: searchParams.get("symbol")
        }
    
        const {asset} = symbolValidation.parse(params);
        
        const markPrice = getMarkPrice(asset.id);
        
    return new Response(JSON.stringify({markPrice}), {
        status: 200,
        headers: {
            "content-type": "application/json"
        }
    })
})