import { symbolValidation } from "@/lib/backend/validations/miscValidations";
import { requestWrapper } from "../requestWrapper";
import {assets} from "@/lib/backend/store";

export const GET = requestWrapper(async (req: Request)=>{
    const {searchParams} = new URL(req.url)
    const params = {
        symbol: searchParams.get("symbol"),
    };
    const { assetId } = symbolValidation.parse(params);
    const asset = assets.find((asset)=>asset.id===assetId)!;
    return new Response(JSON.stringify(asset), {
        status: 200,
        headers: {
            "content-type": "application/json"
        }
    })
})