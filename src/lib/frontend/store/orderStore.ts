import { Asset, Order, Position } from "@/generated/prisma";
import { Loadable, OrderDiffResponse, OrderWithRequiredPrice, PositionDiffResponse, WsResponse } from "@/lib/common/types";
import axios from "axios";
import { create } from "zustand";
import { getUpdatedPositions } from "../utils/positions";
import { useEffect, useState } from "react";
import { addSubscriber, removeSubscriber, Subscriber } from "./socket";
import { getUpdatedorders } from "../utils/orders";

type OrderStore = {
    openOrders: Array<OrderWithRequiredPrice> | null;
    orderHistory: Array<Order> | null;
    updateOrders: (updates: Array<OrderDiffResponse>) => void;
    fetchOrders: () => Promise<void>;
}
const useOrderStore = create<OrderStore>((set)=>({
    openOrders: null,
	orderHistory: null,
    updateOrders: (updates: Array<OrderDiffResponse>) =>{
		set((state)=>{
			if(state.openOrders && state.orderHistory){
				return getUpdatedorders(state.openOrders, state.orderHistory, updates);
			}
			return {}
		})
    },
    fetchOrders: async () =>{
		try{
			const openOrders: Array<OrderWithRequiredPrice> = await axios.get(`/api/open_orders`);
			const orderHistory: Array<Order> = await axios.get(`/api/order_history`);
			set(()=>({openOrders, orderHistory}));
		} catch(e){
			throw new Error("orders fetching went wrong.");
		}
    }
}))

const useInitializePositions = (): "error" | "ready" => {
	const [status, setStatus] = useState<"error" | "ready">("ready");

	const fetchOrders = useOrderStore((state) => state.fetchOrders);
	const updateOrders = useOrderStore((state) => state.updateOrders);

	const subscriber: Subscriber = {
		channel: "openOrders",
		callback: (response: WsResponse) => {
			if (response.channel === "openOrders") {
				updateOrders(response.message);
			}
		},
	};

	const initializePositions = async () => {
		try {
			addSubscriber(subscriber);
			await fetchOrders();
		} catch (e) {
			console.error(e);
			setStatus("error");
		}
	};

	useEffect(() => {
		initializePositions();
		return () => removeSubscriber(subscriber);
	}, []);

	return status;
};

const useOrderHistory = (): Loadable<Array<Order>> => {
	const orderHistory = useOrderStore((state) => state.orderHistory);

	if(orderHistory) return {status: "ready", data: orderHistory}
	return {status: "loading"};
};

const useOpenOrders = (): Loadable<Array<OrderWithRequiredPrice>> => {
	const openOrders = useOrderStore((state) => state.openOrders);

	if(openOrders) return {status: "ready", data: openOrders}
	return {status: "loading"};
};
