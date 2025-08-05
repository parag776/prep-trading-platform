import type { Order } from "../../../../backend/src/generated/prisma";
import type { OrderDiffResponse, OrderWithRequiredPrice } from "../../../../shared/types.mjs";
import configData from "../../../../shared/config.mjs";

export function getUpdatedorders(openOrders: Array<OrderWithRequiredPrice>, orderHistory: Array<Order>, updates: Array<OrderDiffResponse>) {

	const openOrdersMap = new Map<Order["id"], OrderWithRequiredPrice>();

	for (const order of openOrders) {
		openOrdersMap.set(order.id, order);
	}

	console.log(orderHistory)

	const updatedOrderHistory = [...orderHistory];

	for (const update of updates) {

		if (update.price && update.status === "OPEN") {
			// clearly checking the type above but what the heck is happening idk...
			openOrdersMap.set(update.id, update as OrderWithRequiredPrice);
		} else {
			openOrdersMap.delete(update.id);

			if (updatedOrderHistory.length === 0) {
				updatedOrderHistory.push(update);
				continue;
			}

			const latestHistoryTime = updatedOrderHistory[0].createdAt.getTime();

			if (latestHistoryTime >= update.createdAt.getTime()) continue; // in this case orderhistory will not be updated.

			updatedOrderHistory.unshift(update);
			if (updatedOrderHistory.length > configData.order_history_size) updatedOrderHistory.pop();
		}
	}



	const updateOpenOrders = Array.from(openOrdersMap.values());

	return { openOrders: updateOpenOrders, orderHistory: updatedOrderHistory };
}
