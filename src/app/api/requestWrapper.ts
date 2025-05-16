import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]/route";
import { User } from "@/generated/prisma";
import { AppError } from "@/lib/common/error";
import { ZodError } from "zod";

// this function just handles getting user out of session as well as error handling.
export function requestWrapper(cb: (req: Request)=>Promise<Response>): (req: Request)=>Promise<Response>{

    return async function(req: Request){
        try{
            return await cb(req);
        } catch(e){
            if(e instanceof ZodError){
                return new Response(JSON.stringify({
                    message: e.message
                }),{
                    status: 403,
                    headers: {
                        "content-type": "application/json",
                    }
                })

            } else if(e instanceof AppError){

                return new Response(JSON.stringify({
                    message: e.message
                }),{
                    status: e.status,
                    headers: {
                        "content-type": "application/json",
                    }
                })

            } else {
                return new Response(JSON.stringify({
                    message: "internal server error."
                }),{
                    status: 500,
                    headers: {
                        "content-type": "application/json",
                    }
                })
            }
        }
    }
}