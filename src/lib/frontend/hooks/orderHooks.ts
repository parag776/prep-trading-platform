import { Order } from "@/generated/prisma";
import { Loadable, OrderWithRequiredPrice, WsResponse } from "@/lib/common/types";
import { useEffect, useState } from "react";
import { addSubscriber, removeSubscriber, Subscriber } from "../store/socket";
import { useStore } from "../store/store";


export const useInitializePositions = (): "error" | "ready" => {
	const [status, setStatus] = useState<"error" | "ready">("ready");

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
