import { User } from "@/generated/prisma";
import {
	orderbookSubscribers,
	tradebookSubscribers,
	openOrderSubscribers,
	positionSubscribers,
	orderbookResponses,
	tradeResponses,
	positionResponses,
	openOrderResponses,
	setOpenOrderResponses,
	setPositionResponses,
	setOrderbookResponses,
	setTradeResponses,
} from "./state";
import {
	SubscribeMessage,
	OpenOrdersDiffResponse,
	PositionsDiffResponse,
	OrderbookDiffResponse,
	TradeResponse,
} from "@/lib/common/types";

async function subscribe(message: SubscribeMessage, userId: User["id"] | null, client: WebSocket) {
	switch (message.channel) {
		case "orderbook":
			orderbookSubscribers.add(client);
			break;

		case "tradebook":
			tradebookSubscribers.add(client);
			break;

		case "openOrders":
			const openOrderClients = openOrderSubscribers.get(userId!) || new Set<WebSocket>();
			openOrderSubscribers.set(userId!, openOrderClients);
			break;

		case "positions":
			const positionClients = positionSubscribers.get(userId!) || new Set<WebSocket>();
			positionSubscribers.set(userId!, positionClients);
			break;

		default:
			break;
	}
}
// unsubscribe is only valid for when connection is closed.

async function unSubscribe(userId: User["id"] | null, client: WebSocket) {
	orderbookSubscribers.delete(client);
	tradebookSubscribers.delete(client);

	const openOrderClients = openOrderSubscribers.get(userId!)!;
	openOrderClients.delete(client);
	if (openOrderClients.size === 0) {
		openOrderSubscribers.delete(userId!);
	}

	const positionClients = positionSubscribers.get(userId!)!;
	positionClients.delete(client);
	if (positionClients.size === 0) {
		positionSubscribers.delete(userId!);
	}
}
// order responses and trade responses are being sent as an array. please remember this.
export async function respondToSubscribers() {
	if (orderbookResponses.length) {
		for (const client of orderbookSubscribers) {
			client.send(JSON.stringify(orderbookResponses));
		}
	}

	if (tradeResponses.length) {
		for (const client of tradebookSubscribers) {
			client.send(JSON.stringify(tradeResponses));
		}
	}

	for (const [userId, responses] of positionResponses) {
		if (!responses.length) continue;
		const subscribers = positionSubscribers.get(userId);

		if (subscribers) {
			for (const client of subscribers) {
				client.send(JSON.stringify(responses));
			}
		}
	}

	for (const [userId, responses] of openOrderResponses) {
		if (!responses.length) continue;
		const subscribers = openOrderSubscribers.get(userId);

		if (subscribers) {
			for (const client of subscribers) {
				client.send(JSON.stringify(responses));
			}
		}
	}

	// empty all the responses.
	setOpenOrderResponses(new Map<User["id"], Array<OpenOrdersDiffResponse>>());
	setPositionResponses(new Map<User["id"], Array<PositionsDiffResponse>>());
	setOrderbookResponses(new Array<OrderbookDiffResponse>());
	setTradeResponses(new Array<TradeResponse>());
}
