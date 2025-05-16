import { User } from "@/generated/prisma";
import { sessionWrapper } from "../sessionWrapper";
import z from "zod";
import { detailedUsersState } from "@/lib/backend/store";
import prisma from "@/lib/backend/database";

export const POST = sessionWrapper(async (req: Request, userId: User["id"])=>{

    const body = await req.json();

    const validate = z.object({
        amount: z.coerce.number().min(0)
    })

    const {amount} = validate.parse(body);
    const curUser = detailedUsersState.get(userId)!;
    curUser.total_deposit+=amount;
    curUser.usdc+=amount;

    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            total_deposit: curUser.total_deposit,
            usdc: curUser.usdc,
        }
    })
    return new Response("",{
        status: 200
    })

})