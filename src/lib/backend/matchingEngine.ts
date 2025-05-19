import { Order, Order_Status, Order_Type, Prisma, Side, Trade } from "@/generated/prisma";
import { calculateMarginRequirement } from "./marginRequirement";
import { detailedUsersState, latestCandles, orderbooks } from "./store";
import { AppError, ErrorType } from "../common/error";
import config from "../../../config.json"
import { adjustCandle, calculateFee, calculateMaintenanceMargin, calculateMarginWithFee, calculateMarginWithoutFee } from "./utils";
import { OrderBook, OrderWithRequiredPrice } from "./types";
import createRBTree from "functional-red-black-tree";
import prisma from "./database";
import {v4 as uuid } from "uuid";
import { resolutionInfo } from "../common/data";


function createOrder(databaseQueryArray: Array<()=>Prisma.PrismaPromise<any>>, order: Order, orderbook: OrderBook, price: number, quantity: number, average_filled_price: number){
    let orders: createRBTree.Tree<OrderWithRequiredPrice, null>;
    if(order.side===Side.ASK){
        orders = orderbook.askOrderbook.orders;
    } else {
        orders = orderbook.bidOrderbook.orders;
    }

    const updatedOrder: OrderWithRequiredPrice = {...order, type: Order_Type.LIMIT, price, quantity, average_filled_price};
    orders.insert(updatedOrder, null);
    
    // db query
    databaseQueryArray.push(()=>prisma.order.create({
        data: updatedOrder
    }));
}

function processTrade(databaseQueryArray: Array<()=>Prisma.PrismaPromise<any>>, price: number, quantity: number, assetId: string, buyerInfo, sellerInfo, isLastTrade: boolean){

    const trade: Trade = {
        id: uuid(),
        buyerId: buyerInfo.id,
        sellerId: sellerInfo.id,
        price,
        quantity,
        assetId,
        createdAt: new Date(Date.now())
    }

    // if its last trade of the order, process the candle and update historical data.
    if(isLastTrade){
        for(let resolution of resolutionInfo.keys()){
            const candle = latestCandles.get({assetId, resolution})!
            adjustCandle(assetId, resolution, trade)
            databaseQueryArray.push(()=>prisma.historical_Data.upsert({
                where: {
                    assetId_resolution_timestamp: {
                        assetId,
                        resolution,
                        timestamp: candle.timestamp,
                    }
                },
                update: {
                    open: candle.open,
                    high: candle.high,
                    low: candle.low,
                    close: candle.close,
                    volume: candle.volume,
                },
                create: {
                    assetId,
                    resolution,
                    timestamp: candle.timestamp,
                    open: candle.open,
                    high: candle.high,
                    low: candle.low,
                    close: candle.close,
                    volume: candle.volume,
                }
            }))
        }
    }


    databaseQueryArray.push(()=>prisma.trade.create({
        data: trade
    }));

    const buyer = detailedUsersState.get(buyerInfo.id)!;
    const seller = detailedUsersState.get(sellerInfo.id)!;




}

function fillOrder(databaseQueryArray: Array<()=>Prisma.PrismaPromise<any>>, order: OrderWithRequiredPrice, fill: number){
    const user = detailedUsersState.get(order.userId)!;

    // calculating margins here.
    // const margin = calculateMarginWithoutFee(order.price, fill, order.leverage);
    // const fee = calculateFee(order.price, fill, order.leverage, config.maker_fee);

    // user.orderMargin-=margin;
    // // user.nonCashEquity+=margin; // wait there could be a case where positions are reducing instead of increasing, we will have to look into it.
    // user.maintenanceMargin+=calculateMaintenanceMargin(order.price, filled_quantity);

    let userOrders = user.orders;
    let userPositions = user.positions;




        const remainingQuantity = order.quantity - order.filled_quantity;
        if(fill===remainingQuantity){ // remaining quantity
            // remove

            userOrders = userOrders.filter((uOrder)=>{
                return uOrder.id !== order.id;
            });

            // update user margins

            // update to db
            const average_filled_price = (order.filled_quantity*order.average_filled_price + remainingQuantity*order.price)/order.quantity;


            databaseQueryArray.push(()=>prisma.order.update({
                where: {
                    id: order.id,
                },
                data: {
                    filled_quantity: order.quantity,
                    average_filled_price,
                    status: Order_Status.FILLED
                }
            }))

            // send update for order through ws network. note: here only send the updated stuff. don't send all open orders.

        } else {

            //update

            const curFilledQuantity = order.filled_quantity+fill;
            const average_filled_price = (order.filled_quantity*order.average_filled_price + fill*order.price)/curFilledQuantity;

            for(let uOrder of userOrders){

                if(uOrder.id!==order.id) continue;

                uOrder.filled_quantity = curFilledQuantity;
                uOrder.average_filled_price = average_filled_price;

            }

            // update user margins

            // update to db
            databaseQueryArray.push(()=>prisma.order.update({
                where: {
                    id: order.id,
                },
                data: {
                    filled_quantity: curFilledQuantity,
                    average_filled_price,
                    status: Order_Status.FILLED
                }
            }))
            // send update for order through ws network. note: here only send the updated stuff. don't send all open orders.

        // update positions (make current position pnl to be 0, it will be adjusted later when calculating other's pnl)
        
        // first create endpoints, now, without endpoints its going to be difficult, then update order book, then come code this!!!!!!!!!!!!!


        // update user margins and pnl

        // update to db

        // send update for position through ws network. note: here only send the updated stuff. don't send all open positions.

    }



}

export function matchingEngine(order: Order){

    const user = detailedUsersState.get(order.userId)!;
    const marginRequired = calculateMarginRequirement(order);
    if(marginRequired>user.usdc){
        throw new AppError(ErrorType.InsufficientMarginError, `${user.name} with user id ${user.id} doesn't have enough margin for the trade.`, 422);
    }

    let orderbook = orderbooks.get(order.assetId)!;

    // create an array which contains queries to be sent to database.
    const databaseQueryArray: Array<()=>Prisma.PrismaPromise<any>> = []

    // reduce from usdc.
    let orderMargin = 0;
    let totalfee = 0;
    if(order.side===Side.ASK){
            let remainingQuantity = order.quantity
            let currentPositionSize = 0;
            let filledQuantity = 0;
            // if its a market order, price is 0.
            const orderPrice = order.price || 0
            
            for (let bidOrder of orderbook.bidOrderbook.orders.keys) {
    
                // checking condition -> asking price is greater than maximum bidding price. (maker)
                if(orderPrice>bidOrder.price){
                    orderMargin+=calculateMarginWithFee(orderPrice, remainingQuantity, order.leverage, config.maker_fee);

                    let average_filled_price = 0;
                    if(filledQuantity>0){
                        average_filled_price = currentPositionSize/filledQuantity;
                    }

                    createOrder(databaseQueryArray, order, orderbook, orderPrice, remainingQuantity, average_filled_price);

                    remainingQuantity = 0;
                    break;
                }
                
                // checking condition -> remaining quantity is less than current bidOrder quantity (taker)
                if(remainingQuantity<=bidOrder.quantity){
                    totalfee+=calculateFee(bidOrder.price, remainingQuantity, order.leverage, config.taker_fee);

                    

                    const buyerInfo = {
                        id: bidOrder.id,

                    }

                    

                    remainingQuantity = 0;
                    break;
                }
    
                // otherwise, consume this order and move ahead. 
                margin+=calculateMarginWithFee(bidOrder.price, bidOrder.quantity, order.leverage, takerFee);
                remainingQuantity-=bidOrder.quantity;
            }
    
            // if still quantity remaining. (maker)
            if(remainingQuantity){
    
                if(order.type===Order_Type.MARKET){
                    throw new AppError(ErrorType.InsufficientLiquidityError, "There is not enough liquidity in market.", 422)
                }
    
                margin+=calculateMarginWithFee(orderPrice, remainingQuantity, order.leverage, makerFee);
            }
        } else {
    
            let remainingQuantity = order.quantity;
            const orderPrice = order.price || Math.max();
            for (let askOrder of orderbook.askOrderbook.orders.keys){
    
                // checking condition -> bidding price is less than minimum asking price. (maker)
                if(orderPrice<askOrder.price){
                    margin+=calculateMarginWithFee(orderPrice, remainingQuantity, order.leverage, makerFee);
                    remainingQuantity = 0;
                    break;
                }
    
                // checking condition -> remaining quantity is less than current askOrder quantity (taker)
                if(remainingQuantity<=askOrder.quantity){
                    margin+=calculateMarginWithFee(askOrder.price, remainingQuantity, order.leverage, takerFee);
                    remainingQuantity = 0;
                    break;
                }
    
                // otherwise, consume this order and move ahead. 
                margin+=calculateMarginWithFee(askOrder.price, askOrder.quantity, order.leverage, takerFee);
                remainingQuantity-=askOrder.quantity;
            }
            
    
            // if still quantity remaining. (maker)
            if(remainingQuantity){
    
                if(order.type===Order_Type.MARKET){
                    throw new AppError(ErrorType.InsufficientLiquidityError, "There is not enough liquidity in market.", 422) // todo, create new Error Class extending this one.
                }
    
                margin+=calculateMarginWithFee(orderPrice, remainingQuantity, order.leverage, makerFee);
            }
    
        }
    

}