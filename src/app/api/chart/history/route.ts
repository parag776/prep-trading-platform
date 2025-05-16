import prisma from "@/lib/backend/database";
import { getResolutionFromString, resolutionSymbols } from "@/lib/common/data";
import z from "zod";
import { assets } from "@/lib/backend/store";
import { getTime } from "@/lib/backend/utils";

export async function GET(req: Request){

    // params
    try{
        const {searchParams} = new URL(req.url);
        const params = {
            symbol: searchParams.get("symbol"),
            from: searchParams.get("from"),
            to: searchParams.get("to"),
            resolutionString: searchParams.get("resolution"),
            countback: searchParams.get("countback")
        }
        console.log(params)

        // validation schema
        const querySchema = z.object({
            symbol: z.string().refine(val => assets.some(asset => asset.symbol === val), {
                message: "Invalid symbol"
            }),
            resolutionString: z.string().refine(val => resolutionSymbols.includes(val), {
                message: "Invalid resolution"
            }),
            from: z.coerce.number().int().nonnegative(),
            to: z.coerce.number().int().nonnegative(),
            countback: z.coerce.number().int().nonnegative(),
        })

        const {symbol, from, to, resolutionString, countback} = querySchema.parse(params);

        const asset = assets.find((value)=>value.symbol===symbol)!;

        const resolution = getResolutionFromString(resolutionString);

        let fetchedData = await prisma.historical_Data.findMany({
            select: {
                timestamp: true,
                open: true,
                high: true,
                low: true,
                close: true,
                volume: true,
            },
            where: {
                asset, resolution,
                timestamp: {
                    lte: new Date(to)
                },
            },
            orderBy: {
                timestamp: 'asc'
            },
            take: countback
        })

        if(fetchedData.length===0){
            new Response(JSON.stringify({
                s: "no_data",
            }),{
                status: 200,
                headers: {
                    "content-type": "application/json",
                }
            })
        }
        
        // map data here.

        let data = {
            s: "ok",
            t: Array<number>(),
            o: Array<number>(),
            h: Array<number>(),
            l: Array<number>(),
            c: Array<number>(),
            v: Array<number>(),
        }

        for(let datum of fetchedData){
            data.t.push(getTime(datum.timestamp));
            data.c.push(datum.close);
            data.o.push(datum.open);
            data.h.push(datum.high);
            data.l.push(datum.low);
            data.v.push(datum.volume);
        }

        return new Response(JSON.stringify(data),{
            status: 200,
            headers: {
                "content-type": "application/json",
            }
        })

    } catch(e){
        if(e instanceof Error){
            return new Response(JSON.stringify({
                s: "error",
                errmsg: e.message
            }),{
                status: 400,
                headers: {
                    "content-type": "application/json",
                }
            })
        } else {
            return new Response(JSON.stringify({
                s: "error",
                errmsg: "interval server error"
            }),{
                status: 500,
                headers: {
                    "content-type": "application/json",
                }
            })
        }
    }
}