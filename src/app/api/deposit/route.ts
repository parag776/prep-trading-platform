import { User } from "@/generated/prisma";
import { sessionWrapper } from "../sessionWrapper";
import { detailedUsersState } from "@/lib/backend/store";
import prisma from "@/lib/backend/database";
import { depositValidation } from "@/lib/backend/validations/miscValidations";

export const POST = sessionWrapper(async (req: Request, userId: User["id"])=>{
    const body = await req.json();

    let {amount} = depositValidation.parse(body);
    const curUser = detailedUsersState.get(userId)!;

    if(amount+curUser.usdc<0){
        amount = -curUser.usdc;
    }

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