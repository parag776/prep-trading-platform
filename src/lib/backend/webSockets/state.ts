import { Asset, User } from "@/generated/prisma";
import {
	OrderDiffResponse,
	PositionDiffResponse,
	OrderbookDiffResponse,
	TradeResponse,
	SubscribeMessage,
} from "@/lib/common/types";
import WebSocket from "ws";

export const orderbookSubscribers = new Map<Asset["id"], Set<WebSocket>>();
export const tradebookSubscribers = new Map<Asset["id"], Set<WebSocket>>();
export const openOrderSubscribers = new Map<
	{ userId: User["id"]; assetId: Asset["id"] },
	Set<WebSocket>
>();
export const positionSubscribers = new Map<
	{ userId: User["id"]; assetId: Asset["id"] },
	Set<WebSocket>
>();
// why they are not in store and are here?, though they are stateful, but their state is only up until an order arives and fullfills, after that
// they are empty. also, they are not saved in case of crash. so basically they are not stored at all.
// order history will be calculated from openOrderResponses by the client.

export let OrderResponses = new Map<
	{ userId: User["id"]; assetId: Asset["id"] },
	Array<OrderDiffResponse>
>();
export let positionResponses = new Map<
	{ userId: User["id"]; assetId: Asset["id"] },
	Array<PositionDiffResponse>
>();
export let orderbookResponses = new Map<Asset["id"], Array<OrderbookDiffResponse>>();
export let tradeResponses = new Map<Asset["id"], Array<TradeResponse>>();

export let clients = new Map<WebSocket, Set<SubscribeMessage & {userId?: User["id"]}>>();

export const clearOrderResponses = () =>
	(OrderResponses = new Map<
		{ userId: User["id"]; assetId: Asset["id"] },
		Array<OrderDiffResponse>
	>());

export const clearPositionResponses = () =>
	(positionResponses = new Map<
		{ userId: User["id"]; assetId: Asset["id"] },
		Array<PositionDiffResponse>
	>());

export const clearOrderbookResponses = () =>
	(orderbookResponses = new Map<Asset["id"], Array<OrderbookDiffResponse>>());

export const clearTradeResponses = () =>
	(tradeResponses = new Map<Asset["id"], Array<TradeResponse>>());

export const clearAllResponses = () => {
	clearOrderResponses();
	clearPositionResponses();
	clearOrderbookResponses();
	clearTradeResponses();
};