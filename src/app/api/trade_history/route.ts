import prisma from "@/lib/backend/database";
import { requestWrapper } from "../requestWrapper";
import { symbolValidation } from "@/lib/backend/validations/miscValidations";
import { TradeLite } from "@/lib/common/types";

export const GET = requestWrapper(async (req: Request)=>{
    const {searchParams} = new URL(req.url)
    const limit = Number(searchParams.get("limit")) ?? 50;

    const params = {
		symbol: searchParams.get("symbol"),
	};

    console.log(params); // testing here.
    const { assetId } = symbolValidation.parse(params);

    const trades: Array<TradeLite> = await prisma.trade.findMany({
        select: {
            id: true,
            price: true,
            quantity: true,
            createdAt: true,
        },
        where: {
            assetId
        },
        orderBy: {
            createdAt: "desc"
        },
        take: limit
    });

    return new Response(JSON.stringify(trades), {
        status: 200,
        headers: {
            "content-type": "application/json"
        }
    })
})