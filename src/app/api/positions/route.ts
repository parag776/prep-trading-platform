import { User } from "@/generated/prisma";
import { requestWrapper } from "../requestWrapper";
import { detailedUsersState } from "@/lib/backend/store";
import { PositionWithContractPrice } from "@/lib/common/types";
import { getContractPrice } from "@/lib/backend/utils";

// update all positions to position with contract price.!

// @ts-ignore
// ignoring ts here. no need for ts here.
export const GET = requestWrapper((req: Request, userId: User["id"])=>{
    const positions = detailedUsersState.get(userId)?.positions

    let positionArray: PositionWithContractPrice[] = [];
    if(positions){
        positionArray = Array.from(positions.values()).map((position)=>{
            return {...position, pnl: undefined, contractPrice: getContractPrice(position.assetId)}
        })
    }

    return new Response(JSON.stringify(positionArray), {
        status: 200,
        headers: {
            "content-type": "application/json"
        }
    })
})