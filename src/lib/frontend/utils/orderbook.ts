import { Side } from "@/generated/prisma";
import { HalfOrderBookLite, OrderBookLite, OrderLite, OrderbookDiffResponse } from "../../common/types";

export function createOrderbook(): OrderBookLite{
	return {
		lastOrderTimestamp: new Date(0),
		askOrderbook: {
			side: Side.ASK,
			orders: [],
		},
		bidOrderbook: {
			side: Side.BID,
			orders: [],
		}
	}
}

// this function is not used because we will get sell side orders and buy side orders differently.

export function getUpdatedOrderbook(orderbook: OrderBookLite, updates: OrderbookDiffResponse[]): OrderBookLite {
	const askUpdates = updates.filter((order: OrderbookDiffResponse) => {
		return order.side === Side.ASK && order.updatedAt > orderbook.lastOrderTimestamp;
	});

	const bidUpdates = updates.filter((order: OrderbookDiffResponse) => {
		return order.side === Side.BID && order.updatedAt > orderbook.lastOrderTimestamp;
	});

	const updatedAskOrderbook = getUpdatedHalfOrderbook(orderbook.askOrderbook, askUpdates);
	const updatedBidOrderbook = getUpdatedHalfOrderbook(orderbook.bidOrderbook, bidUpdates);

	let lastOrderTimestamp = orderbook.lastOrderTimestamp.getTime();

	for(let update of updates){
		lastOrderTimestamp = Math.max(lastOrderTimestamp, update.updatedAt.getTime());
	}

	return {
		askOrderbook: updatedAskOrderbook,
		bidOrderbook: updatedBidOrderbook,
		lastOrderTimestamp: new Date(lastOrderTimestamp)
	}

}

function getUpdatedHalfOrderbook(
	halfOrderBook: HalfOrderBookLite,
	updates: OrderbookDiffResponse[]
) {
	let updateIndex = 0;
	let updatedBook: HalfOrderBookLite = {
		side: halfOrderBook.side,
		orders: [],
	};

	// merging updates and old order book into new order book, merge 2 sorted arrays, it is assumed that updates are in sorted order.
	let cumulativeQuantity = 0;
	for (let order of halfOrderBook.orders) {
		if (updateIndex >= updates.length) continue;

		while (updates[updateIndex].price < order.price) {
			cumulativeQuantity += updates[updateIndex].changeInQuantity;
			updatedBook.orders.push({
				quantity: updates[updateIndex].changeInQuantity,
				price: updates[updateIndex].price,
				side: updates[updateIndex].side,
				cumulativeQuantity,
			});
			updateIndex++;
		}

		if (updates[updateIndex].price !== order.price) {
			cumulativeQuantity += order.quantity;
			updatedBook.orders.push({ ...order, cumulativeQuantity });
		} else {
			const newQuantity = order.quantity + updates[updateIndex].changeInQuantity;
			if (newQuantity != 0) {
				cumulativeQuantity += newQuantity;
				updatedBook.orders.push({
					quantity: newQuantity,
					price: updates[updateIndex].price,
					side: updates[updateIndex].side,
					cumulativeQuantity,
				});
			}
			updateIndex++;
		}
	}

	// take care of remaining updates
	while (updateIndex < updates.length) {
		cumulativeQuantity += updates[updateIndex].changeInQuantity;
		updatedBook.orders.push({
			quantity: updates[updateIndex].changeInQuantity,
			price: updates[updateIndex].price,
			side: updates[updateIndex].side,
			cumulativeQuantity,
		});
		updateIndex++;
	}

	return updatedBook;
}
