import { Side } from "@/generated/prisma";
import { HalfOrderBookLite, OrderBookLite, OrderLite } from "../common/types";




// this function is not used because we will get sell side orders and buy side orders differently.
export function updateOrderBook(orderbook: OrderBookLite, updates: OrderLite[]){
    
    const askUpdates = updates.filter((order: OrderLite)=>{
        return order.side===Side.ASK;
    });

    const bidUpdates = updates.filter((order: OrderLite)=>{
        return order.side===Side.BID;
    })

    updateHalfOrderBook(orderbook.askOrderbook, askUpdates);
    updateHalfOrderBook(orderbook.bidOrderbook, bidUpdates);

}

export function updateHalfOrderBook(halfOrderBook: HalfOrderBookLite, updates: OrderLite[]){
    let updateIndex = 0;
    let updatedBook: HalfOrderBookLite = {
        side: halfOrderBook.side,
        orders: [],
    };

    // merging updates and old order book into new order book, merge 2 sorted arrays, it is assumed that updates are in sorted order.
    let cumulativeQuantity = 0;
    for(let order of halfOrderBook.orders){
        if(updateIndex>=updates.length) continue;

        while(updates[updateIndex].price<order.price){
            cumulativeQuantity+=updates[updateIndex].quantity;
            updatedBook.orders.push({...updates[updateIndex], cumulativeQuantity});
            updateIndex++;
        }

        if(updates[updateIndex].price!==order.price){
            cumulativeQuantity+=order.quantity;
            updatedBook.orders.push({...order, cumulativeQuantity});
        } else {
            if(updates[updateIndex].quantity!=0){
                cumulativeQuantity+=updates[updateIndex].quantity;
                updatedBook.orders.push({...updates[updateIndex], cumulativeQuantity});
            }
            updateIndex++;
        }
    }

    // take care of remaining updates
    while(updateIndex<updates.length){

        cumulativeQuantity+=updates[updateIndex].quantity;
        updatedBook.orders.push({...updates[updateIndex], cumulativeQuantity});
        updateIndex++;

    }

    halfOrderBook.orders = updatedBook.orders;
}