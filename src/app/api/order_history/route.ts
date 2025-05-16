import prisma from "@/lib/backend/database";
import { sessionWrapper } from "../sessionWrapper";
import { User } from "@/generated/prisma";

export const GET = sessionWrapper(async (req: Request, userId: User["id"])=>{
    const orders = await prisma.order.findMany({
        select: {
            id: true,
            type: true,
            status: true,
            side: true,
            average_filled_price: true,
            quantity: true,
            filled_quantity: true,
            assetId: true,
            leverage: true,
            createdAt: true,
        },
        where: {
            status: {
                in: ["CANCELLED", "FILLED"]
            },
            userId
        }
    });

    return new Response(JSON.stringify(orders), {
        status: 200,
        headers: {
            "content-type": "application/json"
        }
    })
})