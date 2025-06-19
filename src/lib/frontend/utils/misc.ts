import { OrderBookLite, TradeResponse, WsResponse } from "@/lib/common/types";
import {v4 as uuid} from "uuid";

export function getContractPriceFromResponse(response: WsResponse){

    if(response.channel!=="tradebook"){
        throw new Error("response should be a trade response.");
    }

    const message = response.message;
    const latestMessage = message[message.length - 1];
    return latestMessage.price

}

export function getDecimalPrecision(orderbook: OrderBookLite | null){
    const decimalPrecision = {
        quantity: 2,
        price: 2,
    };
    if(!orderbook) return decimalPrecision;
    const askOrders = orderbook.askOrderbook.orders;
    const bidOrders = orderbook.bidOrderbook.orders;
    if (askOrders.length) {
    	decimalPrecision.quantity = Math.min(
    		6,
    		Math.floor(Math.log10(askOrders[askOrders.length - 1].price))
    	);
    	decimalPrecision.price = Math.max(
    		0,
    		6 - Math.floor(Math.log10(askOrders[askOrders.length - 1].price))
    	);
    } else if (bidOrders.length) {
    	decimalPrecision.quantity = Math.max(6, Math.log10(bidOrders[0].price));
    	decimalPrecision.price = Math.max(0, 6 - Math.floor(Math.log10(bidOrders[0].price)));
    }
    return decimalPrecision;
}

export function getArrayWithKeys<T extends Record<string, any>>(array: T[]){
    return array.map((item)=>{
        return {...item, _key: uuid()}
    })
}

