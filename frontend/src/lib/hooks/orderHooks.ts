import type { Order } from "../../../../backend/src/generated/prisma";
import type { Loadable, LoadStatus, OrderWithRequiredPrice, WsResponse } from "../../../../shared/types.mjs";
import { useEffect, useState } from "react";
import { addSubscriber, removeSubscriber, type Subscriber } from "../store/socket";
import { useStore } from "../store/store";


export const useInitializeOrders = (): LoadStatus => {
	const [status, setStatus] = useState<LoadStatus>("loading");

	const fetchOrders = useStore((state) => state.fetchOrders);
	const updateOrders = useStore((state) => state.updateOrders);

	const subscriber: Subscriber = {
		channel: "openOrders",
		callback: (response: WsResponse) => {
			if (response.channel === "openOrders") {
				updateOrders(response.message);
			}
		},
	};

	const initializeOrders = async () => {
		try {
			await fetchOrders();
			addSubscriber(subscriber);
			setStatus("ready")
		} catch (e) {
			console.error(e);
			setStatus("error");
		}
	};

	useEffect(() => {
		initializeOrders();
		return () => removeSubscriber(subscriber);
	}, []);

	return status;
};

export const useOrderHistory = (): Loadable<Array<Order>> => {
	const orderHistory = useStore((state) => state.orderHistory);

	if (orderHistory) return { status: "ready", data: orderHistory };
	return { status: "loading" };
};

export const useOpenOrders = (): Loadable<Array<OrderWithRequiredPrice>> => {
	const openOrders = useStore((state) => state.openOrders);

	if (openOrders) return { status: "ready", data: openOrders };
	return { status: "loading" };
};
