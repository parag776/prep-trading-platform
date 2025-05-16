import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]/route";
import { User } from "@/generated/prisma";
import { AppError } from "@/lib/common/error";
import { ZodError } from "zod";

// this function just handles getting user out of session as well as error handling.
export function sessionWrapper(cb: (req: Request, userId: User["id"])=>Promise<Response>): (req: Request)=>Promise<Response>{

    return async function(req: Request){
        try{
            const session = await getServerSession(authOptions);
            if(!session){
                return new Response(JSON.stringify({
                    message: "user not signed in.",
                }), {
                    status: 401,
                    headers: {
                        "content-type": "application/json",
                    }
                })
            }
            return await cb(req, session.userId);
        } catch(e){
            if(e instanceof ZodError){
                return new Response(JSON.stringify({
                    message: e.errors
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