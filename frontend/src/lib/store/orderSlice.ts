import type { Order } from "../../../../backend/src/generated/prisma";
import type { OrderDiffResponse, OrderWithRequiredPrice } from "../../../../shared/types.mjs";
import axios from "axios";
import { getUpdatedorders } from "../utils/orders";
import type { StateCreator } from "zustand";
import type { OrderSlice, Store } from "./types";


export const createOrderSlice: StateCreator<Store, [], [], OrderSlice>  = (set) => ({
	openOrders: null,
	orderHistory: null,
	updateOrders: (updates: Array<OrderDiffResponse>) => {
		set((state) => {
			if (state.openOrders && state.orderHistory) {
				return getUpdatedorders(state.openOrders, state.orderHistory, updates);
			}
			return {};
		});
	},
	fetchOrders: async () => {
		try {
			const openOrders: Array<OrderWithRequiredPrice> = (await axios.get(`/api/user/open-orders`)).data;
			const orderHistory: Array<Order> = (await axios.get(`/api/user/order-history`)).data;

			set(() => ({ openOrders, orderHistory }));
		} catch (e) {
			throw new Error("Orders fetching went wrong: " + (e instanceof Error ? e.message : String(e)));
		}
	}
});