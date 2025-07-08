import { symbolValidation } from "@/lib/backend/validations/miscValidations";
import { requestWrapper } from "../requestWrapper";
import { getContractPrice } from "@/lib/backend/store/candleStore";

const GET = requestWrapper(async (req: Request)=>{
    const {searchParams} = new URL(req.url);
    const params = {
        symbol: searchParams.get("symbol")
    }

    const {asset} = symbolValidation.parse(params);

    const contractPrice = getContractPrice(asset.id);

    return new Response(JSON.stringify({contractPrice}), {
        status: 200,
        headers: {
            "content-type": "application/json"
        }
    })

})