import { Side } from "@/generated/prisma";
import { HalfOrderBookLite, OrderLite } from "@/lib/common/types";
import { updateHalfOrderBook } from "@/lib/frontend/orderbook";

test("updateHalfOrderBook: from orders to empty", ()=>{
    let orderbook: HalfOrderBookLite = {
        side: Side.BID,
        orders: [{
            side:  Side.ASK,
            price: 10,
            quantity: 20,
            cumulativeQuantity: 20,
        }]
    }

    let updates: Array<OrderLite> = [{
        side: Side.BID,
        price: 10,
        quantity: 0
    }]

    updateHalfOrderBook(orderbook, updates);

    let resultOrderBook: HalfOrderBookLite = {
        side: Side.BID,
        orders: [],
    }

    expect(orderbook).toStrictEqual(resultOrderBook);
})

test("updateHalfOrderBook: from empty to orders", ()=>{
    let orderbook: HalfOrderBookLite = {
        side: Side.BID,
        orders: []
    }

    let updates: Array<OrderLite> = [{
        side: Side.BID,
        price: 10,
        quantity: 12
    }]

    updateHalfOrderBook(orderbook, updates);

    let resultOrderBook: HalfOrderBookLite = {
        side: Side.BID,
        orders: [{
            side:  Side.BID,
            price: 10,
            quantity: 12,
            cumulativeQuantity: 12,
        }],
    }

    expect(orderbook).toStrictEqual(resultOrderBook);
})

test("updateHalfOrderBook: major test", ()=>{
    let orderbook: HalfOrderBookLite = {
        side: Side.ASK,
        orders: [{
            side:  Side.ASK,
            price: 10,
            quantity: 20,
            cumulativeQuantity: 20,
        },
        {
            side:  Side.ASK,
            price: 11,
            quantity: 18,
            cumulativeQuantity: 38,
        },
        {
            side:  Side.ASK,
            price: 15,
            quantity: 5,
            cumulativeQuantity: 43,
        }]
    }

    let updates: Array<OrderLite> = [{
        side: Side.ASK,
        price: 10,
        quantity: 30
    },
    {
        side: Side.ASK,
        price: 14,
        quantity: 7
    },
    {
        side: Side.ASK,
        price: 15,
        quantity: 0
    }]

    let resultOrderBook: HalfOrderBookLite = {
        side: Side.ASK,
        orders: [{
            side:  Side.ASK,
            price: 10,
            quantity: 30,
            cumulativeQuantity: 30,
        },
        {
            side:  Side.ASK,
            price: 11,
            quantity: 18,
            cumulativeQuantity: 48,
        },
        {
            side: Side.ASK,
            price: 14,
            quantity: 7, 
            cumulativeQuantity: 55
        }]
    }

    updateHalfOrderBook(orderbook, updates);

    expect(orderbook).toStrictEqual(resultOrderBook);
})

test("updateHalfOrderBook: major test 2", ()=>{
    let orderbook: HalfOrderBookLite = {
        side: Side.ASK,
        orders: [{
            side:  Side.ASK,
            price: 10,
            quantity: 20,
            cumulativeQuantity: 20,
        },
        {
            side:  Side.ASK,
            price: 11,
            quantity: 18,
            cumulativeQuantity: 38,
        },
        {
            side:  Side.ASK,
            price: 15,
            quantity: 5,
            cumulativeQuantity: 43,
        }]
    }

    let updates: Array<OrderLite> = [{
        side: Side.ASK,
        price: 10,
        quantity: 0
    },
    {
        side: Side.ASK,
        price: 14.1,
        quantity: 7
    },
    {
        side: Side.ASK,
        price: 15,
        quantity: 0
    },
    {
        side: Side.ASK,
        price: 20,
        quantity: 12,
    }]

    let resultOrderBook: HalfOrderBookLite = {
        side: Side.ASK,
        orders: [{
            side:  Side.ASK,
            price: 11,
            quantity: 18,
            cumulativeQuantity: 18,
        },
        {
            side:  Side.ASK,
            price: 14.1,
            quantity: 7,
            cumulativeQuantity: 25,
        },
        {
            side: Side.ASK,
            price: 20,
            quantity: 12, 
            cumulativeQuantity: 37
        }]
    }

    updateHalfOrderBook(orderbook, updates);

    expect(orderbook).toStrictEqual(resultOrderBook);
})