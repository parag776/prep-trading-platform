import { Asset, User } from "../generated/prisma/client.js";
import { OrderDiffResponse, PositionDiffResponse, OrderbookDiffResponse, TradeResponse, SubscriptionMessage, AccountMetricsResponse, SubscriptionMessageWithUserId } from "../../../shared/types.mjs";
import WebSocket from "ws";

// creating subscribe state ----------->
export const orderbookSubscribers = new Map<Asset["id"], Set<WebSocket>>();
export const tradebookSubscribers = new Map<Asset["id"], Set<WebSocket>>();
export const fundingRateSubscribers = new Map<Asset["id"], Set<WebSocket>>();
export const openOrderSubscribers = new Map<string, Set<WebSocket>>();
export const positionSubscribers = new Map<string, Set<WebSocket>>();
export const accountMetricsSubscribers = new Map<User["id"], Set<WebSocket>>();
// why they are not in store and are here?, though they are stateful, but their state is only up until an order arives and fullfills, after that
// they are empty. also, they are not saved in case of crash. so basically they are not stored at all.
// order history will be calculated from openOrderResponses by the client.

// creating Response state ---------->
export let OrderResponses = new Map<string, Array<OrderDiffResponse>>();

export let positionResponses = new Map<string, Array<PositionDiffResponse>>();
export let orderbookResponses = new Map<Asset["id"], Array<OrderbookDiffResponse>>();
export let tradeResponses = new Map<Asset["id"], Array<TradeResponse>>();
export let accountMetricsResponses = new Map<User["id"], AccountMetricsResponse>();

export let clients = new Map<WebSocket, Set<SubscriptionMessageWithUserId>>();

/// clearing responses --------->
export const clearOrderResponses = () => (OrderResponses = new Map<string, Array<OrderDiffResponse>>());

export const clearPositionResponses = () => (positionResponses = new Map<string, Array<PositionDiffResponse>>());

export const clearOrderbookResponses = () => (orderbookResponses = new Map<Asset["id"], Array<OrderbookDiffResponse>>());

export const clearTradeResponses = () => (tradeResponses = new Map<Asset["id"], Array<TradeResponse>>());

export const clearAccountMetricResponses = () => (accountMetricsResponses = new Map<User["id"], AccountMetricsResponse>());

export const clearAllResponses = () => {
	clearOrderResponses();
	clearPositionResponses();
	clearOrderbookResponses();
	clearTradeResponses();
	clearAccountMetricResponses();
};
