import { z } from "zod";
import { sessionWrapper } from "../sessionWrapper";
import { Order_Type, Side, User } from "@/generated/prisma";
import { assets, spotPrices, symbolToAssetId } from "@/lib/backend/store";
import config from "../../../../config.json"

export const POST = sessionWrapper(async (req: Request, userId: String) => {
  const preValidatedOrder = await req.json();

  const orderValidation = z.object({
    type: z.string().refine((val) => Object.keys(Order_Type).includes(val)),
    side: z.string().refine((val) => Object.keys(Side).includes(val)),
    symbol: z
      .string()
      .refine((symbol) => assets.some((asset) => asset.symbol === symbol), {
        message: "symbol is not valid.",
      }),
    price: z.coerce.number(),
    quantity: z.coerce.number(),
    leverage: z.coerce.number().int().min(config.leverage_min).max(config.leverage_max),
  }).transform((data) => {
    const assetId = symbolToAssetId.get(data.symbol)!;
    const {symbol, ...rest} = data;
    return {...rest, assetId}
  }).superRefine((obj, ctx)=>{
    const spotPrice = spotPrices.get(obj.assetId)!
    const minPrice = spotPrice*config.min_order_ratio;
    const maxPrice = spotPrice*config.max_order_ratio;
    if(obj.price<minPrice){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Order price is way below spot price.",
            path: ["price"]
        })
    } else if(obj.price>maxPrice){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Order price is way above spot price.",
            path: ["price"]
        })
    }
  })

  const order =  orderValidation.parse(preValidatedOrder);


  return new Response(JSON.stringify(order),{
    status: 200,
    headers: {
        "content-type": "application/json"
    }
  });
});
