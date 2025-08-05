import type { OrderBookLite, WsResponse } from "../../../../shared/types.mjs";
import { shallow } from "zustand/shallow";
import { v4 as uuid } from "uuid";
import type { TradeBook } from "./tradebook";
import axios from "axios";

export function getContractPriceFromResponse(response: WsResponse) {
	if (response.channel !== "tradebook") {
		throw new Error("response should be a trade response.");
	}

	const message = response.message;
	const latestMessage = message[message.length - 1];
	return latestMessage.price;
}

export function getDecimalPrecision(orderbook: OrderBookLite | null) {
	const decimalPrecision = {
		quantity: 2,
		price: 2,
	};
	if (!orderbook) return decimalPrecision;
	const askOrders = orderbook.askOrderbook.orders;
	const bidOrders = orderbook.bidOrderbook.orders;
	if (askOrders.length) {
		decimalPrecision.quantity = Math.min(6, Math.floor(Math.log10(askOrders[askOrders.length - 1].price)));
		decimalPrecision.price = Math.max(0, 6 - Math.floor(Math.log10(askOrders[askOrders.length - 1].price)));
	} else if (bidOrders.length) {
		decimalPrecision.quantity = Math.min(6, Math.floor(Math.log10(bidOrders[0].price)));
		decimalPrecision.price = Math.max(0, 6 - Math.floor(Math.log10(bidOrders[0].price)));
	}
	return decimalPrecision;
}

export function getQuantityPrecisionFromPrice(price: number){
	return Math.min(6, Math.floor(Math.log10(price)))
}

export function fixDecimalPrecision(value: number, precision: number): string {
	return value.toFixed(precision);
}

export function getPriceDirection(tradebook: TradeBook): "up" | "down" | "flat" {
	const trades = tradebook.trades;
	if (trades.length < 2) return "flat";
	if (trades[0].price > trades[1].price) return "up";
	if (trades[0].price < trades[1].price) return "down";
	return "flat";
}

export function getCurrentPrice(tradebook: TradeBook) {
	return tradebook.trades.length === 0 ? 0 : tradebook.trades[0].price;
}

export function getArrayWithKeys<T extends Record<string, any>>(array: T[]) {
	return array.map((item) => {
		return { ...item, _key: uuid() };
	});
}

export const fetchMarkPrice = async (assetId: string) => {
	try {
		const res = await axios.get(`https://fapi.binance.com/fapi/v1/premiumIndex`, {
			params: { symbol: assetId + "USDC" },
		});

		return parseFloat(res.data.markPrice); // markPrice is a string
	} catch (err) {
		throw new Error("Failed to fetch mark price: " + (err instanceof Error ? err.message : String(err)));
	}
};

export function computed<const TDeps extends readonly unknown[] = unknown[], TResult = unknown>(
	depsFn: () => TDeps,
	computeFn: (...deps: TDeps) => TResult
): () => TResult {
	let prevDeps: TDeps | null = null;
	let cachedResult: TResult;
	return () => {
		const deps = depsFn();
		if (prevDeps === undefined || !shallow(prevDeps, deps)) {
			prevDeps = deps;
			cachedResult = computeFn(...deps);
		}
		return cachedResult;
	};
}