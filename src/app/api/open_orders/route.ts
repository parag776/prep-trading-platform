import { User } from "@/generated/prisma";
import { sessionWrapper } from "../sessionWrapper";
import { detailedUsersState} from "@/lib/backend/store";
import { OrderWithRequiredPrice } from "@/lib/common/types";
export const GET = sessionWrapper(async (req: Request, userId: User["id"])=>{

    const openOrders = detailedUsersState.get(userId)?.orders

    let ordersArray: OrderWithRequiredPrice[] = [];
    if(openOrders){
        ordersArray = Array.from(openOrders.values()).map((order)=>{
            return order
        })
    }

    return new Response(JSON.stringify(ordersArray), {
        status: 200,
        headers: {
            "content-type": "application/json"
        }
    });

});