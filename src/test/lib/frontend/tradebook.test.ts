import {Trade, TradeBook, insertIntoTradebook} from "@/lib/frontend/tradebook";
import { Side } from "@/lib/frontend/orderbook";

test("tradebook: insert into tradebook", ()=>{

    const trade: Trade = {
        price: 10.2,
        quantity: 20,
        side: Side.Ask,
        timestamp: 1234
    }

    const tradebook: TradeBook = {
        maxTradeBookSize: 2,
        trades: [{
            price: 10.2,
            quantity: 10,
            side: Side.Ask,
            timestamp: 5333
        }]
    };

    const resultTradebook: TradeBook = {
        maxTradeBookSize: 2,
        trades: [{
            price: 10.2,
            quantity: 10,
            side: Side.Ask,
            timestamp: 5333
        },
        {
            price: 10.2,
            quantity: 20,
            side: Side.Ask,
            timestamp: 1234
        }]
    }

    insertIntoTradebook(tradebook, trade);

    expect(tradebook).toStrictEqual(resultTradebook);

})

test("tradebook: insert into tradebook with max size", ()=>{

    const trade: Trade = {
        price: 11,
        quantity: 20,
        side: Side.Ask,
        timestamp: 1234,
    }

    const tradebook: TradeBook = {
        maxTradeBookSize: 2,
        trades: [{
            price: 10.2,
            quantity: 10,
            side: Side.Ask,
            timestamp: 2345 
        },
        {
            price: 13,
            quantity: 20,
            side: Side.Ask,
            timestamp: 3456
        }
    ]
    };

    const resultTradebook: TradeBook = {
        maxTradeBookSize: 2,
        trades: [{
            price: 13,
            quantity: 20,
            side: Side.Ask,
            timestamp:3456
        },
        {
            price: 11,
            quantity: 20,
            side: Side.Ask,
            timestamp: 1234,
        }]
    }

    insertIntoTradebook(tradebook, trade);

    expect(tradebook).toStrictEqual(resultTradebook);

})