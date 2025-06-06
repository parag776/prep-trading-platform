import prisma from "@/lib/backend/database";
import { requestWrapper } from "../requestWrapper";
import { sessionWrapper } from "../sessionWrapper";

export const GET = sessionWrapper(async (req: Request, userId: string)=>{
    const data = await prisma.user.findFirst({
        select: {
            usdc: true
        },
        where: {
            id: userId
        }
    })

    return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
            "content-type": "application/json"
        }
    })
})