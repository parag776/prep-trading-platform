import { User } from "@/generated/prisma";
import {
	OpenOrdersDiffResponse,
	PositionsDiffResponse,
	OrderbookDiffResponse,
	TradeResponse,
} from "@/lib/common/types";

export const orderbookSubscribers = new Set<WebSocket>();
export const tradebookSubscribers = new Set<WebSocket>();
export const openOrderSubscribers = new Map<User["id"], Set<WebSocket>>();
export const positionSubscribers = new Map<User["id"], Set<WebSocket>>();
// why they are not in store and are here?, though they are stateful, but their state is only up until an order arives and fullfills, after that
// they are empty. also, they are not saved in case of crash. so basically they are not stored at all.
// order history will be calculated from openOrderResponses by the client.

export let openOrderResponses = new Map<User["id"], Array<OpenOrdersDiffResponse>>();
export let positionResponses = new Map<User["id"], Array<PositionsDiffResponse>>();
export let orderbookResponses = new Array<OrderbookDiffResponse>();
export let tradeResponses = new Array<TradeResponse>();

// Response setters
export const setOpenOrderResponses = (data: Map<string, OpenOrdersDiffResponse[]>) =>
	(openOrderResponses = data);
export const setPositionResponses = (data: Map<string, PositionsDiffResponse[]>) =>
	(positionResponses = data);
export const setOrderbookResponses = (data: OrderbookDiffResponse[]) => (orderbookResponses = data);
export const setTradeResponses = (data: TradeResponse[]) => (tradeResponses = data);
