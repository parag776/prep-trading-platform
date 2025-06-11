import { Asset, Historical_Data, Resolution, Side, Trade } from "@/generated/prisma";
import { latestCandles, markPrices, orderbooks } from "./store";
import { resolutionInfo } from "../common/data";
import config from "../../../config.json";
import { CumulativeOrderLite, OrderBookLite, OrderWithRequiredPrice } from "../common/types";
import createRBTree from "functional-red-black-tree";
import { UserWithPositionsAndOpenOrders } from "./types";

export function calculateMarginWithoutFee(price: number, quantity: number, leverage: number) {
	return (price * quantity) / leverage;
}

export function calculateFee(price: number, quantity: number, leverage: number, feeRate: number) {
	return ((price * quantity) / leverage) * feeRate;
}

export function calculateMarginWithFee(price: number, quantity: number, leverage: number, fee: number) {
	return ((price * quantity) / leverage) * (1 + fee);
}

export function calculateMaintenanceMargin(price: number, quantity: number) {
	return price * quantity * config.maintainence_margin;
}

// seeing if the candle is past their life, if not adjust it and if it is then create a new candle.
export function adjustCandle(assetId: Asset["id"], resolution: Resolution, trade: Trade) {
	const currentCandle = latestCandles.get({ assetId, resolution })!;
	const duration = resolutionInfo.get(resolution)!.duration;
	const tradetime = getTime(trade.createdAt);

	const candleStartTimestamp = Math.floor(tradetime / duration) * duration;

	if (getTime(currentCandle.timestamp) < candleStartTimestamp) {
		currentCandle.timestamp = new Date(candleStartTimestamp);
		currentCandle.open = trade.price;
		currentCandle.high = trade.price;
		currentCandle.low = trade.price;
		currentCandle.close = trade.price;
		currentCandle.volume = trade.quantity;
	} else {
		currentCandle.close = trade.price;
		currentCandle.high = Math.max(currentCandle.high, trade.price);
		currentCandle.low = Math.min(currentCandle.low, trade.price);
		currentCandle.volume += trade.quantity;
	}
}

export function getContractPrice(assetId: Asset["id"]) {
	return latestCandles.get({ assetId, resolution: Resolution.ONE_MINUTE })!.close;
}

export function getMarkPrice(assetId: Asset["id"]): number {
	return markPrices.get(assetId)!;
}

export function getTime(date: Date) {
	return Math.floor(date.getTime() / 1000);
}

// pure function -->
function getOrdersLiteArray(orders: createRBTree.Tree<OrderWithRequiredPrice, null>) {
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

export function getAllResolutionData(data: Array<Historical_Data>) {
	const allResolutionData = new Array<Historical_Data>();
	const millisecondsInAMinute = 60 * 1000;

	for (const resolution of resolutionInfo) {
		let curCandle: Historical_Data = structuredClone(data[0]);
		curCandle.resolution = resolution[0];
		let endTime = curCandle.timestamp.getTime();

		for (let i = 1; i < data.length; i++) {
			if ((data[i].timestamp.getTime() + millisecondsInAMinute) % resolution[1].duration === 0) {
				// start of new candle time curtime%duration = -1
				endTime = data[i].timestamp.getTime();
				curCandle.timestamp = structuredClone(data[i - 1].timestamp);
				allResolutionData.push(curCandle);
				curCandle = structuredClone(data[i]);
				curCandle.resolution = resolution[0];
			}

			curCandle.low = Math.min(data[i].low, curCandle.low);
			curCandle.high = Math.max(data[i].high, curCandle.high);
			curCandle.open = data[i].open;
			curCandle.volume += data[i].volume;
			// close is already taken into account.
		}

		const candleStart = Math.floor(data[data.length - 1].timestamp.getTime() / resolution[1].duration) * resolution[1].duration;
		curCandle.timestamp = new Date(candleStart);
		allResolutionData.push(curCandle);
	}

	return allResolutionData;
}

export function calculateUserPnl(user: UserWithPositionsAndOpenOrders) {
	let pnl = 0;
	for (const [positionId, position] of user.positions) {
		let profit = (getMarkPrice(position.assetId) - position.average_price) * position.quantity;
		if (position.side === Side.ASK) {
			profit = -profit;
		}
		pnl += profit;
	}
	return pnl;
}
