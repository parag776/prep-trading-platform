import { Asset, Order, Position, Side, Trade, User } from "@/generated/prisma";
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
} from "./state";
import {
	SubscribeMessage,
	WsResponse,
} from "@/lib/common/types";
import WebSocket from "ws";
import { getContractPrice } from "../utils";

// assetid can be all here.. for openOrders and positions.
export function subscribe(message: SubscribeMessage, userId: User["id"] | undefined, client: WebSocket) {
	switch (message.channel) {
		case "orderbook":
			const orderbookClients = orderbookSubscribers.get(message.assetId) ?? new Set<WebSocket>();
			orderbookClients.add(client)
			orderbookSubscribers.set(message.assetId, orderbookClients);
			break;

		case "tradebook":
			let tradebookClients = tradebookSubscribers.get(message.assetId) ?? new Set<WebSocket>();
			tradebookClients.add(client)
			tradebookSubscribers.set(message.assetId, tradebookClients);
			break;

		case "openOrders":
			if(userId){
				const key = {
					userId,
					assetId: message.assetId,
				}
				const openOrderClients = openOrderSubscribers.get(key) ?? new Set<WebSocket>();
				openOrderClients.add(client);
				openOrderSubscribers.set(key, openOrderClients);
			}
			break;

		case "positions":
			if(userId){
				const key = {
					userId,
					assetId: message.assetId,
				}
				const positionClients = positionSubscribers.get(key) ?? new Set<WebSocket>();
				positionClients.add(client);
				positionSubscribers.set(key, positionClients);
			}
			break;

		default:
			break;
	}
	
	// adding subscription to client. if its order/position...userId will be there because of validations..
	clients.get(client)?.add({...message, userId})!
}

export function unSubscribe(message: SubscribeMessage, userId: User["id"] | undefined, client: WebSocket) {
	switch (message.channel) {
		case "orderbook":
			const orderbookClients = orderbookSubscribers.get(message.assetId);
			if (orderbookClients) {
				orderbookClients.delete(client);
				if (orderbookClients.size === 0) {
					orderbookSubscribers.delete(message.assetId);
				}
			}
			break;

		case "tradebook":
			const tradebookClients = tradebookSubscribers.get(message.assetId);
			if (tradebookClients) {
				tradebookClients.delete(client);
				if (tradebookClients.size === 0) {
					tradebookSubscribers.delete(message.assetId);
				}
			}
			break;

		case "openOrders":
			if (userId) {
				const key = { userId, assetId: message.assetId };
				const openOrderClients = openOrderSubscribers.get(key);
				if (openOrderClients) {
					openOrderClients.delete(client);
					if (openOrderClients.size === 0) {
						openOrderSubscribers.delete(key);
					}
				}
			}
			break;

		case "positions":
			if (userId) {
				const key = { userId, assetId: message.assetId };
				const positionClients = positionSubscribers.get(key);
				if (positionClients) {
					positionClients.delete(client);
					if (positionClients.size === 0) {
						positionSubscribers.delete(key);
					}
				}
			}
			break;

		default:
			break;
	}

	// removing subscription from client. if its order/position...userId will be there because of validations..
	clients.get(client)?.add({...message, userId, type: "subscribe"})!
}

// suppose some client disconnects without unsubscribing, this handles cleanup.....this function is kinda slow

export function handleClientConnect(client: WebSocket){
	clients.set(client, new Set<SubscribeMessage & {userId?: User["id"]}>());
}

export function handleClientDisconnect(client: WebSocket) {

	const subscriptions = clients.get(client);

	if(subscriptions){
		for(const subscription of subscriptions){
			unSubscribe({type: "unsubscribe", channel: subscription.channel, assetId: subscription.assetId}, subscription.userId, client);
		}
	}

	clients.delete(client);
}


// order responses and trade responses are being sent as an array. please remember this.
export function respondToSubscribers() {

	function respond(subscribers: Set<WebSocket> | undefined, response: WsResponse){
		if(subscribers){
			for (const client of subscribers) {
				client.send(JSON.stringify(response));
			}
		}
	}

	// respond to orderbook..
	for(const [assetId, responses] of orderbookResponses){

		if(!responses.length) continue;
		const subscribers = orderbookSubscribers.get(assetId);
		const response: WsResponse = {channel: "orderbook", assetId, message: responses};
		respond(subscribers, response);
	}

	// respond to tradebook
	for(const [assetId, responses] of tradeResponses){

		if(!responses.length) continue;
		const response: WsResponse = {channel: "tradebook", assetId, message: responses};
		const subscribers = tradebookSubscribers.get(assetId);
		respond(subscribers, response);
	}

	// respond to positions
	for (const [key, responses] of positionResponses) {
		if (!responses.length) continue;
		const subscribers = positionSubscribers.get(key);
		const response: WsResponse = {channel: "positions", assetId: key.assetId, message: responses};
		respond(subscribers, response);

		// respond to clients who have subscribed for all assets
		const responseForAll: WsResponse = {...response, assetId: "all"};
		const subscribersForAll = positionSubscribers.get({...key, assetId: "all"});
		respond(subscribersForAll, responseForAll);
	}

	for (const [key, responses] of OrderResponses) {
		if (!responses.length) continue;
		const subscribers = openOrderSubscribers.get(key);
		const response: WsResponse = {channel: "openOrders", assetId: key.assetId, message: responses};
		respond(subscribers, response);

		// respond to clients who have subscribed for all assets
		const responseForAll: WsResponse = {...response, assetId: "all"};
		const subscribersForAll = openOrderSubscribers.get({...key, assetId: "all"});
		respond(subscribersForAll, responseForAll);
	}

	// empty all the responses.
	clearAllResponses()
}

export function addPositionResponse(position: Position) {
	const key = {userId: position.userId, assetId: position.assetId};
	const responseArray = positionResponses.get(key) ?? [];
	responseArray.push({...position, contractPrice: -1, channel: "positions"});
	positionResponses.set(key, responseArray);
}

export function updatePositionResponsesContractPrice(){
	for(const [key, responses] of positionResponses){
		const contractPrice = getContractPrice(key.assetId);
		for(const response of responses){
			response.contractPrice = contractPrice;
		}
	}
}

export function addOrderbookDiffResponse(
	assetId: Asset["id"],
	side: Side,
	price: number,
	changeInQuantity: number
) {
	orderbookResponses.get(assetId)?.push({
		channel: "orderbook",
		assetId,
		side,
		price,
		changeInQuantity,
		updatedAt: new Date(Date.now()),
	});
}

export function addOrderDiffResponse(order: Order) {
	const key = {userId: order.userId, assetId: order.assetId};
	const responseArray = OrderResponses.get(key) ?? [];
	order.updatedAt = new Date(Date.now());
	responseArray.push({...order, channel: "openOrders"})
	OrderResponses.set(key, responseArray);
}

export function addTradeResponse(trade: Trade) {
	tradeResponses.get(trade.assetId)?.push({
		channel: "tradebook",
		id: trade.id,
		createdAt: trade.createdAt,
		assetId: trade.assetId,
		price: trade.price,
		quantity: trade.quantity,
	});
}