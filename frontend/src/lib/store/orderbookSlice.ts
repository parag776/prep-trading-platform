import type { Asset } from "../../../../backend/src/generated/prisma";
import type { OrderbookDiffResponse, OrderBookLite } from "../../../../shared/types.mjs";
import axios from "axios";
import type { StateCreator } from "zustand";
import { getUpdatedOrderbook } from "../utils/orderbook";
import type { DecimalPrecision, OrderbookSlice, Store } from "./types";
import { computed } from "../utils/misc";

export const createOrderbookSlice: StateCreator<Store, [], [], OrderbookSlice> = (set, get) => ({
	orderbook: null,
	fetchOrderbook: async (asset: Asset) => {
		try {
			const data: OrderBookLite = (await axios.get(`/api/asset/orderbook?symbol=${asset.symbol}`)).data;
			set(() => ({ orderbook: data }));
		} catch (e) {
			throw new Error("Orderbook fetching went wrong: " + (e instanceof Error ? e.message : String(e)));
		}
	},
	updateOrderbook: (updates: Array<OrderbookDiffResponse>) => {
		set((state) => {
			if (state.orderbook) {
				const orderbook = getUpdatedOrderbook(state.orderbook, updates);
				return { orderbook };
			} else {
				return {};
			}
		});
	},
	getDecimalPrecision: computed(()=>[get().orderbook], (orderbook): DecimalPrecision=>{
		const decimalPrecision = {
			quantity: 2,
			price: 2,
		};
		if(!orderbook) return decimalPrecision;
		const askOrders = orderbook.askOrderbook.orders;
		const bidOrders = orderbook.bidOrderbook.orders;
		if (askOrders.length) {
			decimalPrecision.quantity = Math.min(
				6,
				Math.floor(Math.log10(askOrders[askOrders.length - 1].price))
			);
			decimalPrecision.price = Math.max(
				0,
				6 - Math.floor(Math.log10(askOrders[askOrders.length - 1].price))
			);
		} else if (bidOrders.length) {
			decimalPrecision.quantity = Math.max(6, Math.log10(bidOrders[0].price));
			decimalPrecision.price = Math.max(0, 6 - Math.floor(Math.log10(bidOrders[0].price)));
		}
		return decimalPrecision;
	})
});