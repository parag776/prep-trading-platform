import type { TradeLite, TradeResponse } from "../../../../shared/types.mjs";
import configData from "../../../../shared/config.mjs";

export type TradeBook = {
    maxTradeBookSize: number,
    trades: Array<TradeLite>
}

export function createTradebook(maxTradeBookSize: number = configData.trade_book_size): TradeBook{
    return {
        maxTradeBookSize, 
        trades: []
    }
}

// function without a sideEffect.
// i should create all react functions without sideEffects.
export function getUpdatedTradebook(tradebook: TradeBook, updates: TradeResponse[]){

    const updatedTradebook = {...tradebook};
    for(const trade of updates){
        if(updatedTradebook.trades.length===0){
            updatedTradebook.trades.push(trade);
            continue;
        }

        const latestTradeTime = updatedTradebook.trades[0].createdAt.getTime();

        if(latestTradeTime>=trade.createdAt.getTime()) continue; // in this case tradebook is not updated.

        updatedTradebook.trades.unshift(trade);
        if(updatedTradebook.trades.length>updatedTradebook.maxTradeBookSize) updatedTradebook.trades.pop();

    }
    return updatedTradebook
}



