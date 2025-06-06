import { TradeResponse, WsResponse } from "@/lib/common/types";
import {v4 as uuid} from "uuid";

export function getContractPriceFromResponse(response: WsResponse){

    if(response.channel!=="tradebook"){
        throw new Error("response should be a trade response.");
    }

    const message = response.message;
    const latestMessage = message[message.length - 1];
    return latestMessage.price

}


export function getArrayWithKeys<T extends Record<string, any>>(array: T[]){
    return array.map((item)=>{
        return {...item, _key: uuid()}
    })
}

