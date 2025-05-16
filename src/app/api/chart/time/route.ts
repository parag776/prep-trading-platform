import { getTime } from "@/lib/backend/utils";
import { requestWrapper } from "../../requestWrapper";

export const GET = requestWrapper(async (req: Request)=>{
    let serverTime = getTime(new Date(Date.now()));
    return new Response(serverTime.toString());
})