import { getAllAssets } from "@/lib/backend/store/assetStore";
import { requestWrapper } from "../requestWrapper";

export const GET = requestWrapper(async (req: Request)=>{
    return new Response(JSON.stringify(getAllAssets()), {
        status: 200,
        headers: {
            "content-type": "application/json"
        }
    })
})