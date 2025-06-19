import { Order } from "@/generated/prisma";
import { OrderDiffResponse, OrderWithRequiredPrice } from "@/lib/common/types";
import axios from "axios";
import { getUpdatedorders } from "../utils/orders";
import { StateCreator } from "zustand";
import { OrderSlice, Store } from "./types";


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
			const openOrders: Array<OrderWithRequiredPrice> = await axios.get(`/api/open_orders`);
			const orderHistory: Array<Order> = await axios.get(`/api/order_history`);
			set(() => ({ openOrders, orderHistory }));
		} catch (e) {
			throw new Error("Orders fetching went wrong: " + (e instanceof Error ? e.message : String(e)));
		}
	},
});