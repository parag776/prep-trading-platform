import { Order, Order_Status } from "@/generated/prisma";
import { OrderDiffResponse, OrderWithRequiredPrice } from "@/lib/common/types";
import configData from "../../../../config.json";

export function getUpdatedorders(openOrders: Array<OrderWithRequiredPrice>, orderHistory: Array<Order>, updates: Array<OrderDiffResponse>) {
	const openOrdersMap = new Map<Order["id"], OrderWithRequiredPrice>();

	for (const order of openOrders) {
		openOrdersMap.set(order.id, order);
	}

	const updatedOrderHistory = [...orderHistory];

	for (const update of updates) {
		if (update.price && update.status === Order_Status.OPEN) {
			// clearly checking the type above but what the heck is happening idk...
			openOrdersMap.set(update.id, update as OrderWithRequiredPrice);
		} else {
			openOrdersMap.delete(update.id);

			if (updatedOrderHistory.length === 0) {
				updatedOrderHistory.push(update);
				continue;
			}

			const latestHistoryTime = updatedOrderHistory[0].updatedAt.getTime();

			if (latestHistoryTime >= update.updatedAt.getTime()) continue; // in this case orderhistory will not be updated.

			updatedOrderHistory.unshift(update);
			if (updatedOrderHistory.length > configData.order_history_size) updatedOrderHistory.pop();
		}
	}

	const updateOpenOrders = Array.from(openOrdersMap.values());

	return { openOrders: updateOpenOrders, orderHistory: updatedOrderHistory };
}
