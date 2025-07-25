import { Asset, Order, Side, User } from "@/generated/prisma";
import { HalfOrderBook, OrderBook } from "../types";
import { getOpenOrdersByAssetFromDB } from "../database";
import { getAllAssets } from "./assetStore";
import { CumulativeOrderLite, OrderBookLite, OrderWithRequiredPrice } from "@/lib/common/types";
import createRBTree from "functional-red-black-tree";

let orderbooks: Map<Asset["id"], OrderBook>;

export async function initializeOrderbooks() {
    orderbooks = new Map<Asset["id"], OrderBook>(
        await Promise.all(
            getAllAssets().map(async (asset: Asset) => {
                const orders = await getOpenOrdersByAssetFromDB(asset);
                
                let askOrders = createRBTree<OrderWithRequiredPrice, null>((key1: OrderWithRequiredPrice, key2: OrderWithRequiredPrice) => {
                    if (key1.price === key2.price) {
                        if (key1.createdAt < key2.createdAt) {
                            return -1;
                        } else if (key1.createdAt > key2.createdAt) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                    if (key1.price < key2.price) {
                        return -1;
                    } else {
                        return 1;
                    }
                });

                let bidOrders = createRBTree<OrderWithRequiredPrice, null>((key1: OrderWithRequiredPrice, key2: OrderWithRequiredPrice) => {
                    if (key1.price === key2.price) {
                        if (key1.createdAt < key2.createdAt) {
                            return -1;
                        } else if (key1.createdAt > key2.createdAt) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                    if (key1.price > key2.price) {
                        // only difference in ask and bid is the comparison operator.
                        return -1;
                    } else {
                        return 1;
                    }
                });

                for (let order of orders) {
                    if (order.side === Side.ASK) {
                        askOrders = askOrders.insert(order, null);
                    } else {
                        bidOrders = bidOrders.insert(order, null);
                    }
                }

                const askOrderbook: HalfOrderBook = {
                    side: Side.ASK,
                    orders: askOrders,
                };
                const bidOrderbook: HalfOrderBook = {
                    side: Side.BID,
                    orders: bidOrders,
                };

                const orderbook: OrderBook = {
                    asset: asset.id,
                    askOrderbook,
                    bidOrderbook,
                };

                return [asset.id, orderbook] as [Asset["id"], OrderBook];
            })
        )
    );
}

// pure function -->
export function getOrdersLiteArray(orders: createRBTree.Tree<OrderWithRequiredPrice, null>) {
    const ordersArray = orders.keys;

    const ordersLite = new Array<CumulativeOrderLite>();

    let latestOrderTime: number = 0;
    if (ordersArray.length === 0) return { ordersLite, latestOrderTime };

    const side = ordersArray[0].side;
    let price = ordersArray[0].price;
    let quantity = ordersArray[0].quantity;
    let cumulativeQuantity = ordersArray[0].quantity;
    latestOrderTime = ordersArray[0].createdAt.getTime();

    for (let i = 1; i < ordersArray.length; i++) {
        latestOrderTime = Math.max(latestOrderTime, ordersArray[i].createdAt.getTime());
        if (price === ordersArray[i].price) {
            quantity += ordersArray[i].price;
        } else {
            ordersLite.push({ price, quantity, cumulativeQuantity, side });
            price = ordersArray[i].price;
            quantity = ordersArray[i].quantity;
        }
        cumulativeQuantity += ordersArray[i].quantity;
    }
    ordersLite.push({ price, quantity, cumulativeQuantity, side });

    return { ordersLite, latestOrderTime };
}

// pure function -->
export function getOrderbookLite(assetId: Asset["id"]) {
    const orderbook = orderbooks.get(assetId)!;

    const askOrders = orderbook.askOrderbook.orders;
    const bidOrders = orderbook.bidOrderbook.orders;

    const askOrdersLite = getOrdersLiteArray(askOrders);
    const bidOrdersLite = getOrdersLiteArray(bidOrders);

    const orderbookLite: OrderBookLite = {
        lastOrderTimestamp: new Date(Math.max(askOrdersLite.latestOrderTime, bidOrdersLite.latestOrderTime)),
        askOrderbook: {
            side: Side.ASK,
            orders: askOrdersLite.ordersLite,
        },
        bidOrderbook: {
            side: Side.BID,
            orders: bidOrdersLite.ordersLite,
        },
    };

    return orderbookLite;
}

export function getOrderbooks(): Readonly<Map<Asset["id"], OrderBook>> {
    return orderbooks
}

export function getOrderbook(assetId: User["id"]): Readonly<OrderBook> {
    const orderbook = orderbooks.get(assetId);
    if(!orderbook){
		throw new Error(`orderbook with userId -> ${assetId} not found.`);
    } else {
        return orderbook;
    }
}

export function removeOrderFromOrderbook(order: OrderWithRequiredPrice){
    if (order.side === Side.ASK) {
		orderbooks.get(order.assetId)?.askOrderbook.orders!.remove(order);
	} else {
		orderbooks.get(order.assetId)?.bidOrderbook.orders!.remove(order);
	}
}

export function addOrderToOrderbook(order: OrderWithRequiredPrice) {
    if (order.side === Side.ASK) {
        orderbooks.get(order.assetId)?.askOrderbook.orders!.insert(order, null);
    } else {
        orderbooks.get(order.assetId)?.bidOrderbook.orders!.insert(order, null);
    }
}

export function printOrderbook(orderbook: OrderBook){
	console.log("asset: ", orderbook.asset);
	console.log("ask-orders: ");
	(orderbook.askOrderbook.orders).forEach((key)=>{
		console.log(key);
	})
	
	console.log("bid-orders: ");
	(orderbook.askOrderbook.orders).forEach((key)=>{
		console.log(key);
	})
}