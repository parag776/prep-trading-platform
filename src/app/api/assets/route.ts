import { assets } from "@/lib/backend/store";
import { requestWrapper } from "../requestWrapper";

const GET = requestWrapper(async (req: Request)=>{
    return new Response(JSON.stringify(assets), {
        status: 200,
        headers: {
            "content-type": "application/json"
        }
    })
})