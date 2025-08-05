import type { HalfOrderBookLite, OrderBookLite, OrderbookDiffResponse } from "../../../../shared/types.mjs";

export function createOrderbook(): OrderBookLite{
	return {
		lastOrderTimestamp: new Date(0),
		askOrderbook: {
			side: "ASK",
			orders: [],
		},
		bidOrderbook: {
			side: "BID",
			orders: [],
		}
	}
}

export function getUpdatedOrderbook(orderbook: OrderBookLite, updates: OrderbookDiffResponse[]): OrderBookLite {
	
	
	const askUpdates = updates.filter((order: OrderbookDiffResponse) => {
		return order.side === "ASK" && order.updatedAt > orderbook.lastOrderTimestamp;
	});

	const bidUpdates = updates.filter((order: OrderbookDiffResponse) => {
		return order.side === "BID" && order.updatedAt > orderbook.lastOrderTimestamp;
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

function isBetterAskingPrice(a: number, b: number){
	return a<b;
}

function isBetterBiddingPrice(a: number, b: number){
	return a>b;
}

const infinitesimal = 1e-9;

function getUpdatedHalfOrderbook(
	halfOrderBook: HalfOrderBookLite,
	updates: OrderbookDiffResponse[]
) {


	const isBetterPrice = halfOrderBook.side==="ASK"?isBetterAskingPrice:isBetterBiddingPrice

	let updateIndex = 0;
	let updatedBook: HalfOrderBookLite = {
		side: halfOrderBook.side,
		orders: [],
	};

	// merging updates and old order book into new order book, merge 2 sorted arrays, it is assumed that updates are in sorted order.
	let cumulativeQuantity = 0;
	for (let order of halfOrderBook.orders) {
		if (updateIndex >= updates.length) {
			cumulativeQuantity += order.quantity;
			updatedBook.orders.push({ ...order, cumulativeQuantity });
			continue;
		}
		while (updateIndex<updates.length && isBetterPrice(updates[updateIndex].price, order.price)) {
			cumulativeQuantity += updates[updateIndex].changeInQuantity;
			updatedBook.orders.push({
				quantity: updates[updateIndex].changeInQuantity,
				price: updates[updateIndex].price,
				side: updates[updateIndex].side,
				cumulativeQuantity,
			});
			updateIndex++;
		}

		if (updateIndex>=updates.length || updates[updateIndex].price !== order.price) {
			cumulativeQuantity += order.quantity;
			updatedBook.orders.push({ ...order, cumulativeQuantity });
		} else {
			const newQuantity = order.quantity + updates[updateIndex].changeInQuantity;
			if (newQuantity > infinitesimal) {
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
