import { Asset, Order, Position, Side, Trade, User } from "../generated/prisma/client.js";
import {
	orderbookSubscribers,
	tradebookSubscribers,
	openOrderSubscribers,
	positionSubscribers,
	orderbookResponses,
	tradeResponses,
	positionResponses,
	OrderResponses,
	clearAllResponses,
	clients,
	accountMetricsSubscribers,
	accountMetricsResponses,
	fundingRateSubscribers,
} from "./state.js";
import {
	AccountMetricsResponse,
	OrderbookDiffResponse,
	OrderDiffResponse,
	PositionDiffResponse,
	SubscriptionMessage,
	SubscriptionMessageWithUserId,
	TradeResponse,
	WsResponse,
} from "../../../shared/types.mjs";
import WebSocket from "ws";
import { UserWithPositionsAndOpenOrders } from "../types.js";

// assetid can be all here.. for openOrders and positions.
function subscribe(message: SubscriptionMessageWithUserId, client: WebSocket) {
	switch (message.channel) {
		case "orderbook":
			const orderbookClients = orderbookSubscribers.get(message.assetId) ?? new Set<WebSocket>();
			orderbookClients.add(client);
			orderbookSubscribers.set(message.assetId, orderbookClients);
			clients.get(client)?.add(message);
			break;

		case "tradebook":
			let tradebookClients = tradebookSubscribers.get(message.assetId) ?? new Set<WebSocket>();
			tradebookClients.add(client);
			tradebookSubscribers.set(message.assetId, tradebookClients);
			clients.get(client)?.add(message);
			break;

		case "fundingRate":
			let fundingRateClients = fundingRateSubscribers.get(message.assetId) ?? new Set<WebSocket>();
			fundingRateClients.add(client);
			fundingRateSubscribers.set(message.assetId, fundingRateClients);
			clients.get(client)?.add(message);
			break;

		case "openOrders":
			if (message.userId) {
				const key = JSON.stringify({
					userId: message.userId,
					assetId: message.assetId ?? null,
				});
				const openOrderClients = openOrderSubscribers.get(key) ?? new Set<WebSocket>();
				openOrderClients.add(client);
				openOrderSubscribers.set(key, openOrderClients);
				clients.get(client)?.add(message);
			}
			break;

		case "positions":
			if (message.userId) {
				const key = JSON.stringify({
					userId: message.userId,
					assetId: message.assetId ?? null,
				});
				const positionClients = positionSubscribers.get(key) ?? new Set<WebSocket>();
				positionClients.add(client);
				positionSubscribers.set(key, positionClients);
				clients.get(client)?.add(message);
			}
			break;

		case "accountMetrics":
			if (message.userId) {
				const accountMetricsClients = accountMetricsSubscribers.get(message.userId) ?? new Set<WebSocket>();
				accountMetricsClients.add(client);
				accountMetricsSubscribers.set(message.userId, accountMetricsClients);
				clients.get(client)?.add(message);
			}
			break;
		default:
			break;
	}
}

function unSubscribe(message: SubscriptionMessageWithUserId, client: WebSocket) {
	switch (message.channel) {
		case "orderbook":
			const orderbookClients = orderbookSubscribers.get(message.assetId);
			if (orderbookClients) {
				orderbookClients.delete(client);
				if (orderbookClients.size === 0) {
					orderbookSubscribers.delete(message.assetId);
				}
			}
			clients.get(client)?.delete({ ...message, type: "subscribe" });
			break;

		case "tradebook":
			const tradebookClients = tradebookSubscribers.get(message.assetId);
			if (tradebookClients) {
				tradebookClients.delete(client);
				if (tradebookClients.size === 0) {
					tradebookSubscribers.delete(message.assetId);
				}
			}
			clients.get(client)?.delete({ ...message, type: "subscribe" });
			break;

			
		case "fundingRate":
			let fundingRateClients = fundingRateSubscribers.get(message.assetId);
			if(fundingRateClients){
				fundingRateClients.delete(client);
				if(fundingRateClients.size === 0){
					fundingRateSubscribers.delete(message.assetId);
				}
			}
			clients.get(client)?.delete({...message, type: "subscribe"});
			break;

		case "openOrders":
			if (message.userId) {
				const key = JSON.stringify({ userId: message.userId, assetId: message.assetId ?? null });
				const openOrderClients = openOrderSubscribers.get(key);
				if (openOrderClients) {
					openOrderClients.delete(client);
					if (openOrderClients.size === 0) {
						openOrderSubscribers.delete(key);
					}
				}
				clients.get(client)?.delete({ ...message, type: "subscribe" });
			}
			break;

		case "positions":
			if (message.userId) {
				const key = JSON.stringify({ userId: message.userId, assetId: message.assetId ?? null });
				const positionClients = positionSubscribers.get(key);
				if (positionClients) {
					positionClients.delete(client);
					if (positionClients.size === 0) {
						positionSubscribers.delete(key);
					}
				}
				clients.get(client)?.delete({ ...message, type: "subscribe" });
			}
			break;
		case "accountMetrics":
			if (message.userId) {
				const accountMetricsClients = accountMetricsSubscribers.get(message.userId);
				if (accountMetricsClients) {
					accountMetricsClients.delete(client);
					if (accountMetricsClients.size === 0) {
						accountMetricsSubscribers.delete(message.userId);
					}
				}
				clients.get(client)?.delete({ ...message, type: "subscribe" });
			}
			break;
		default:
			break;
	}
}

export function handleSubscriptionMessage(msg: SubscriptionMessageWithUserId, client: WebSocket){
	if(msg.type ==="subscribe"){
		subscribe(msg, client);
	} else if(msg.type==="unsubscribe") {
		unSubscribe(msg, client);
	}
}

export function handleClientConnect(client: WebSocket) {
	clients.set(client, new Set<SubscriptionMessageWithUserId>());
}

// suppose some client disconnects without unsubscribing, this handles cleanup.....this function is kinda slow
export function handleClientDisconnect(client: WebSocket) {
	const subscriptions = clients.get(client);

	if (subscriptions) {
		for (const subscription of subscriptions) {
			unSubscribe(subscription, client);
		}
	}

	clients.delete(client);
}



export function addOrderbookDiffResponse(assetId: Asset["id"], side: Side, price: number, changeInQuantity: number) {
	const responseArray = orderbookResponses.get(assetId) ?? [];
	const response: OrderbookDiffResponse = {
		channel: "orderbook",
		assetId,
		side,
		price,
		changeInQuantity,
		updatedAt: new Date(Date.now()),
	};
	responseArray.push(response);
	orderbookResponses.set(assetId, responseArray);
}

export function addTradeResponse(trade: Trade) {
	const responseArray = tradeResponses.get(trade.assetId) ?? [];
	const response: TradeResponse = {
		channel: "tradebook",
		id: trade.id,
		createdAt: trade.createdAt,
		assetId: trade.assetId,
		price: trade.price,
		quantity: trade.quantity,
	};
	responseArray.push(response);
	tradeResponses.set(trade.assetId, responseArray);
}

export function addOrderDiffResponse(order: Order) {
	const response: OrderDiffResponse = { ...order, channel: "openOrders" };
	response.updatedAt = new Date(Date.now());

	// responses for where client is asking for a specific asset
	{
		const key = JSON.stringify({ userId: order.userId, assetId: order.assetId });
		const responseArray = OrderResponses.get(key) ?? [];
		responseArray.push(response);
		OrderResponses.set(key, responseArray);
	}

	// responses for where client is asking for not specific asset...so basically all assets.
	{
		const key = JSON.stringify({ userId: order.userId, assetId: null });
		const responseArray = OrderResponses.get(key) ?? [];
		responseArray.push(response);
		OrderResponses.set(key, responseArray);
	}
}

export function addPositionResponse(position: Position) {
	const response: PositionDiffResponse = { ...position, channel: "positions" };

	// responses for where client is asking for a specific asset
	{
		const key = JSON.stringify({ userId: position.userId, assetId: position.assetId });
		const responseArray = positionResponses.get(key) ?? [];
		responseArray.push(response);
		positionResponses.set(key, responseArray);
	}

	// responses for where client is asking for not specific asset...so basically all assets.
	{
		const key = JSON.stringify({ userId: position.userId, assetId: null });
		const responseArray = positionResponses.get(key) ?? [];
		responseArray.push(response);
		positionResponses.set(key, responseArray);
	}
}

export function addAccountMetricResponse(user: UserWithPositionsAndOpenOrders) {
	const accountMetric: AccountMetricsResponse = {
		channel: "accountMetrics",
		usdc: user.usdc,
		orderMargin: user.orderMargin,
		initialMargin: user.initialMargin,
		maintenanceMargin: user.maintenanceMargin,
		unpaidFunding: user.funding_unpaid,
	};
	accountMetricsResponses.set(user.id, accountMetric);
}

// order responses and trade responses are being sent as an array. please remember this.
export function respondToSubscribers() {

	function respond(subscribers: Set<WebSocket> | undefined, response: WsResponse) {
		if (subscribers) {
			for (const client of subscribers) {
				client.send(JSON.stringify(response));
			}
		}
	}

	// respond to orderbook..
	for (const [assetId, responses] of orderbookResponses) {
		if (!responses.length) continue;
		const subscribers = orderbookSubscribers.get(assetId);
		const wsResponse: WsResponse = { channel: "orderbook", assetId, message: responses };
		respond(subscribers, wsResponse);
	}

	// respond to tradebook
	for (const [assetId, responses] of tradeResponses) {
		if (!responses.length) continue;
		const wsResponse: WsResponse = { channel: "tradebook", assetId, message: responses };
		const subscribers = tradebookSubscribers.get(assetId);
		respond(subscribers, wsResponse);
	}

	// respond to positions
	for (const [key, responses] of positionResponses) {
		if (!responses.length) continue;
		const subscribers = positionSubscribers.get(key);
		const wsResponse: WsResponse = {
			channel: "positions",
			assetId: JSON.parse(key).assetId ?? undefined,
			message: responses,
		};
		respond(subscribers, wsResponse);
	}

	for (const [key, responses] of OrderResponses) {
		if (!responses.length) continue;
		const subscribers = openOrderSubscribers.get(key);
		const wsResponse: WsResponse = {
			channel: "openOrders",
			assetId: JSON.parse(key).assetId ?? undefined,
			message: responses,
		};
		respond(subscribers, wsResponse);
	}

	for (const [userId, response] of accountMetricsResponses) {
		const subscribers = accountMetricsSubscribers.get(userId);
		const wsResponse: WsResponse = {
			channel: "accountMetrics",
			message: response,
		};
		respond(subscribers, wsResponse);
	}

	// empty all the responses.
	clearAllResponses();
}

export function respondToFundingRateSubscribers(fundingRate: number, assetId: Asset["id"]){
	const subscribers = fundingRateSubscribers.get(assetId);
	if(subscribers){
		for(const client of subscribers){
			const response: WsResponse = {
				channel: "fundingRate",
				assetId,
				message: {
					fundingRate
				}
			}
			client.send(JSON.stringify(response));
		}
	}
}