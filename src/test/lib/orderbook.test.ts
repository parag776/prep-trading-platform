import { updateHalfOrderBook } from "@/lib/orderbook";
import { HalfOrderBook, Order, Side, CumulativeOrder } from "@/lib/orderbook";

test("updateHalfOrderBook: from orders to empty", ()=>{
    let orderbook: HalfOrderBook<Side.Bid> = {
        side: Side.Bid,
        orders: [{
            side:  Side.Ask,
            price: 10,
            quantity: 20,
            cumulativeQuantity: 20,
        }]
    }

    let updates: Array<Order> = [{
        side: Side.Bid,
        price: 10,
        quantity: 0
    }]

    updateHalfOrderBook(orderbook, updates);

    let resultOrderBook: HalfOrderBook<Side.Bid> = {
        side: Side.Bid,
        orders: [],
    }

    expect(orderbook).toStrictEqual(resultOrderBook);
})

test("updateHalfOrderBook: from empty to orders", ()=>{
    let orderbook: HalfOrderBook<Side.Bid> = {
        side: Side.Bid,
        orders: []
    }

    let updates: Array<Order> = [{
        side: Side.Bid,
        price: 10,
        quantity: 12
    }]

    updateHalfOrderBook(orderbook, updates);

    let resultOrderBook: HalfOrderBook<Side.Bid> = {
        side: Side.Bid,
        orders: [{
            side:  Side.Bid,
            price: 10,
            quantity: 12,
            cumulativeQuantity: 12,
        }],
    }

    expect(orderbook).toStrictEqual(resultOrderBook);
})

test("updateHalfOrderBook: major test", ()=>{
    let orderbook: HalfOrderBook<Side.Ask> = {
        side: Side.Ask,
        orders: [{
            side:  Side.Ask,
            price: 10,
            quantity: 20,
            cumulativeQuantity: 20,
        },
        {
            side:  Side.Ask,
            price: 11,
            quantity: 18,
            cumulativeQuantity: 38,
        },
        {
            side:  Side.Ask,
            price: 15,
            quantity: 5,
            cumulativeQuantity: 43,
        }]
    }

    let updates: Array<Order> = [{
        side: Side.Ask,
        price: 10,
        quantity: 30
    },
    {
        side: Side.Ask,
        price: 14,
        quantity: 7
    },
    {
        side: Side.Ask,
        price: 15,
        quantity: 0
    }]

    let resultOrderBook: HalfOrderBook<Side.Ask> = {
        side: Side.Ask,
        orders: [{
            side:  Side.Ask,
            price: 10,
            quantity: 30,
            cumulativeQuantity: 30,
        },
        {
            side:  Side.Ask,
            price: 11,
            quantity: 18,
            cumulativeQuantity: 48,
        },
        {
            side: Side.Ask,
            price: 14,
            quantity: 7, 
            cumulativeQuantity: 55
        }]
    }

    updateHalfOrderBook(orderbook, updates);

    expect(orderbook).toStrictEqual(resultOrderBook);
})

test("updateHalfOrderBook: major test 2", ()=>{
    let orderbook: HalfOrderBook<Side.Ask> = {
        side: Side.Ask,
        orders: [{
            side:  Side.Ask,
            price: 10,
            quantity: 20,
            cumulativeQuantity: 20,
        },
        {
            side:  Side.Ask,
            price: 11,
            quantity: 18,
            cumulativeQuantity: 38,
        },
        {
            side:  Side.Ask,
            price: 15,
            quantity: 5,
            cumulativeQuantity: 43,
        }]
    }

    let updates: Array<Order> = [{
        side: Side.Ask,
        price: 10,
        quantity: 0
    },
    {
        side: Side.Ask,
        price: 14.1,
        quantity: 7
    },
    {
        side: Side.Ask,
        price: 15,
        quantity: 0
    },
    {
        side: Side.Ask,
        price: 20,
        quantity: 12,
    }]

    let resultOrderBook: HalfOrderBook<Side.Ask> = {
        side: Side.Ask,
        orders: [{
            side:  Side.Ask,
            price: 11,
            quantity: 18,
            cumulativeQuantity: 18,
        },
        {
            side:  Side.Ask,
            price: 14.1,
            quantity: 7,
            cumulativeQuantity: 25,
        },
        {
            side: Side.Ask,
            price: 20,
            quantity: 12, 
            cumulativeQuantity: 37
        }]
    }

    updateHalfOrderBook(orderbook, updates);

    expect(orderbook).toStrictEqual(resultOrderBook);
})