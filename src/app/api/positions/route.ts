import { User } from "@/generated/prisma";
import { requestWrapper } from "../requestWrapper";
import { detailedUsersState } from "@/lib/backend/store";

// @ts-ignore
// ignoring ts here. no need for ts here.
export const GET = requestWrapper((req: Request, userId: User["id"])=>{
    const positions = detailedUsersState.get(userId)?.positions
    return new Response(JSON.stringify(positions), {
        status: 200,
        headers: {
            "content-type": "application/json"
        }
    })
})