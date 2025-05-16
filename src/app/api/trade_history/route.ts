import prisma from "@/lib/backend/database";
import { requestWrapper } from "../requestWrapper";

export const GET = requestWrapper(async (req: Request)=>{
    const trades = await prisma.trade.findMany({
        select: {
            id: true,
            price: true,
            quantity: true,
            asset: {
                select: {
                    id: true,
                    symbol: true,
                }
            },
            createdAt: true,
        }
    });

    return new Response(JSON.stringify(trades), {
        status: 200,
        headers: {
            "content-type": "application/json"
        }
    })
})