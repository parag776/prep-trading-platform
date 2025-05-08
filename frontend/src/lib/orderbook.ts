export enum Side{
    Bid = "BID",
    Ask = "ASK",
}

export enum OrderStatus{
    Uninitialized,    
    Initialized,
    Filled,
    PartiallyFilled,
    Cancelled
}

export interface Order{
    side: Side,
    price: number,
    quantity: number
}

export interface CumulativeOrder extends Order{
    cumulativeQuantity: number,
}

export interface HalfOrderBook<T extends Side>{
    side: T,
    orders: CumulativeOrder[]
}

export interface OrderBook{
    askOrders: HalfOrderBook<Side.Ask>,
    bidOrders: HalfOrderBook<Side.Bid>
}

// this function is not used because we will get sell side orders and buy side orders differently.
export function updateOrderBook(orderbook: OrderBook, updates: Order[]){
    
    const askUpdates = updates.filter((order: Order)=>{
        return order.side===Side.Ask;
    });

    const bidUpdates = updates.filter((order: Order)=>{
        return order.side===Side.Bid;
    })

    updateHalfOrderBook(orderbook.askOrders, askUpdates);
    updateHalfOrderBook(orderbook.bidOrders, bidUpdates);

}

export function updateHalfOrderBook<T extends Side>(halfOrderBook: HalfOrderBook<T>, updates: Order[]){
    let updateIndex = 0;
    let updatedBook: HalfOrderBook<T> = {
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