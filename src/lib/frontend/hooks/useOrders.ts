import { OrderWithRequiredPrice } from "@/lib/common/types";
import { useSocketSubscribe } from "./useSocketSubscribe";
import { useEffect, useState } from "react";
import { getUpdatedorders } from "../utils/orders";
import { Order } from "@/generated/prisma";
import axios from "axios";

type Orders = {
	openOrders: Array<OrderWithRequiredPrice>;
	orderHistory: Array<Order>;
}

export function useOrders(userId: string) {
	const [orders, setOrders] = useState<null | Orders>(null);

	useSocketSubscribe("openOrders", "all", (response)=>{
		if(response.channel === "openOrders"){
			setOrders((orders)=>{
				return getUpdatedorders(orders?.openOrders ?? [], orders?.orderHistory ?? [], response.message);
			})
		}
	})

	async function fetchOrders(){
		const openOrders: Array<OrderWithRequiredPrice> = await axios.get(`/api/open_orders`);
		const orderHistory: Array<Order> = await axios.get(`/api/order_history`);

		setOrders({openOrders, orderHistory});
	}

	useEffect(() => {
		fetchOrders()
			.catch(() => {
				throw new Error("orders fetching went wrong.");
			});
	}, [userId]);

	if(orders===null) return null;

	return {openOrders: orders.openOrders, orderHistory: orders.orderHistory};
}
