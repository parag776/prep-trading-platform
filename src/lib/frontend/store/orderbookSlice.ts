import { Asset } from "@/generated/prisma";
import { OrderbookDiffResponse, OrderBookLite } from "@/lib/common/types";
import axios from "axios";
import { StateCreator } from "zustand";
import { getUpdatedOrderbook } from "../utils/orderbook";
import { OrderbookSlice, Store } from "./types";



export const createOrderbookSlice: StateCreator<Store, [], [], OrderbookSlice> = (set) => ({
	orderbook: null,
	fetchOrderbook: async (asset: Asset) => {
		try {
			const data: OrderBookLite = (await axios.get(`/api/orderbook?symbol=${asset.symbol}`)).data;
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
});