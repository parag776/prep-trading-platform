import { shallow } from "zustand/shallow";
import type { WsResponse, Channel, SubscriptionMessage, Subscription, Prettify } from "../../../../shared/types.mjs";
import type { Asset } from "../../../../backend/src/generated/prisma";
import { useEffect } from "react";
import { useStore } from "./store";

export type Subscriber = Prettify<Subscription & { callback: (response: WsResponse) => void }>;

let socket: WebSocket | null = null;
let subscribers: Array<Subscriber> = [];
let subscriptions = new Map<String, number>();

function dateReviver(_: string, value: any) {
	if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
		return new Date(value);
	}
	return value;
}

function sendWhenReady(socket: WebSocket, message: any) {
	if (socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify(message));
	} else {
		socket.addEventListener(
			"open",
			() => {
				socket.send(JSON.stringify(message));
			},
			{ once: true }
		);
	}
}

export function getSocket() {
	if (!socket) {
		socket = new WebSocket("/ws");

		socket.addEventListener("open", () => {
			console.log("connected to socket successfully");
		});

		socket.onmessage = (messageEvent) => {

			const response: WsResponse = JSON.parse(messageEvent.data, dateReviver);
			const { message, ...responseSubscription } = response;
			const callbacks = subscribers.filter((subscriber) => {
				const { callback, ...subscription } = subscriber;
				return shallow(responseSubscription, subscription); // checks for shallow equality
			});
			callbacks.map(({ callback }) => callback(response));
		};
	}
	return socket;
}

export const addSubscriber: (subscriber: Subscriber) => void = (subscriber: Subscriber) => {
	const { callback, ...subscription } = subscriber;

	const key = JSON.stringify(subscription);
	const subscriptionCount = subscriptions.get(key);
	
	
	if (!subscriptionCount) {
		// subscribing
		const subMessage: SubscriptionMessage = {
			type: "subscribe",
			...subscription,
		};
		sendWhenReady(getSocket(), subMessage);
		const key = JSON.stringify(subscription);
		subscriptions.set(key, 1);
	} else {
		subscriptions.set(key, subscriptionCount + 1);
	}
	subscribers.push(subscriber);
};

export const removeSubscriber: (subscriber: Subscriber) => void = (subscriber: Subscriber) => {
	const { callback, ...subscription } = subscriber;
	const UnSubMessage: SubscriptionMessage = {
		type: "unsubscribe",
		...subscription,
	};

	const key = JSON.stringify(subscription);

	const subscriptionCount = subscriptions.get(key);	
	if (!subscriptionCount) return;

	if (subscriptionCount === 1) {
		sendWhenReady(getSocket(), UnSubMessage);
		subscriptions.delete(key);
	} else {
		subscriptions.set(key, subscriptionCount - 1);
	}

	subscribers = subscribers.filter((existing) => existing !== subscriber);
};

export function useSocketSubscribe(channel: Channel, assetId: Asset["id"], callback: (response: WsResponse) => void) {
	const isAuthenticated = useStore((state) => state.authenticationStatus === "authenticated");

	if ((channel === "openOrders" || channel === "positions") && !isAuthenticated) return null;

	useEffect(() => {
		const subscriber = { channel, assetId, callback };
		addSubscriber(subscriber);
		return () => {
			removeSubscriber(subscriber);
		};
	}, []);
}

export function getSubscribers(): readonly Subscriber[] {
	return subscribers;
}
