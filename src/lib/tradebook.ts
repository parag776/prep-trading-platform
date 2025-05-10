
import { Side } from "./orderbook"


export interface Trade{
    price: number,
    quantity: number,
    timestamp: number,
    side: Side
}

export interface TradeBook{
    maxTradeBookSize: number,
    trades: Array<Trade>
}

export function insertIntoTradebook(tradebook: TradeBook, trade: Trade){
    tradebook.trades.push(trade);
    if(tradebook.trades.length>tradebook.maxTradeBookSize){
        tradebook.trades = tradebook.trades.filter((_, i)=>{
            return i!==0;
        });
    }
}



