import { User } from "@/generated/prisma";
import { sessionWrapper } from "../sessionWrapper";
import { detailedUsersState} from "@/lib/backend/store";

export const GET = sessionWrapper(async (req: Request, userId: User["id"])=>{

    return new Response(JSON.stringify(detailedUsersState.get(userId)?.orders), {
        status: 200,
        headers: {
            "content-type": "application/json"
        }
    });

});