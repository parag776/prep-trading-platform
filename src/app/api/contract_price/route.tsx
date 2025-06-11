import { symbolValidation } from "@/lib/backend/validations/miscValidations";
import { requestWrapper } from "../requestWrapper";
import { getContractPrice } from "@/lib/backend/utils";

const GET = requestWrapper(async (req: Request)=>{
    const {searchParams} = new URL(req.url);
    const params = {
        symbol: searchParams.get("symbol")
    }

    const {assetId} = symbolValidation.parse(params);

    const contractPrice = getContractPrice(assetId);

    return new Response(JSON.stringify({contractPrice}), {
        status: 200,
        headers: {
            "content-type": "application/json"
        }
    })

})