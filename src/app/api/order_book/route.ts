import { User } from "@/generated/prisma";
import { sessionWrapper } from "../sessionWrapper";
import { z } from "zod";
import { assets, symbolToAssetId } from "@/lib/backend/store";
import { getOrderbookLite } from "@/lib/backend/utils";

export const GET = sessionWrapper(async (req: Request, userId: User["id"])=>{

    const body = await req.json();

    const validationSchema = z.object({
        symbol: z.string().refine((symbol) => assets.some((asset) => asset.symbol === symbol), {
            message: "symbol is not valid.",
        }),
    }).transform((data) => {
        const assetId = symbolToAssetId.get(data.symbol)!;
        const {symbol, ...rest} = data;
        return {...rest, assetId}
    })

    const {assetId} = validationSchema.parse(body);

    const orderbook = getOrderbookLite(assetId)

    return new Response(JSON.stringify(orderbook),{
        status: 200,
        headers: {
            "content-type": "application/json"
        }
    });
    
})