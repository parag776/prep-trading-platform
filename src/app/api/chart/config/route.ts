import { requestWrapper } from "../../requestWrapper";
import { resolutionInfo } from "@/lib/common/data";

export const GET = requestWrapper(async function(req: Request){

    const {searchParams} = new URL(req.url);
    const symbol = searchParams.get('symbol');
    const resolutionSymbols = Array.from(resolutionInfo.values()).map(({symbol})=>symbol);

    console.log(resolutionSymbols);

    const config = {
        supported_resolutions: resolutionSymbols,
        supports_group_request: true,
        supports_marks: false,
        supports_search: false,
        supports_timescale_marks: false,
    }

    return new Response(JSON.stringify(config),{
        status: 200,
        headers: {
            "content-type": "application/json",
        }
    })
})