import { main } from "@/lib/backend/main";
import { requestWrapper } from "../requestWrapper";

export const GET = requestWrapper(async (req: Request)=>{

    await main();
    return new Response("");
})