import { shallow } from 'zustand/shallow';
import { WsResponse, Channel, SubscriptionMessage, Subscription, Prettify } from "@/lib/common/types";
import { Asset } from '@/generated/prisma';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export type Subscriber = Prettify<Subscription & { callback: (response: WsResponse) => void }>;

let socket: WebSocket | null = null;
let subscribers: Array<Subscriber> = [];
let subscriptions = new Map<Subscription, number>();

function sendWhenReady(socket: WebSocket, message: any) {
	if (socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify(message));
	} else {
		socket.addEventListener("open", () => {
			socket.send(JSON.stringify(message));
		}, { once: true });
	}
}

export function getSocket() {
  if (!socket) {
    socket = new WebSocket("/api/ws");

    socket.addEventListener("open", ()=>{
        console.log("connected to socket successfully");
    })

    socket.onmessage = (messageEvent) => {

        const response: WsResponse = JSON.parse(messageEvent.data.toString());
        const {message, ...responseSubscription} = response;
        const callbacks = subscribers.filter((subscriber) => {
            const {callback, ...subscription} = subscriber;
            return shallow(responseSubscription, subscription); // checks for shallow equality
        });

        callbacks.map(({ callback }) => callback(response));
    };

  }
  return socket;
}

export const addSubscriber: (subscriber: Subscriber) => void = (subscriber: Subscriber) => {
    const { callback, ...subscription } = subscriber;


    const subscriptionCount = subscriptions.get(subscription);
    if (!subscriptionCount) {
        // subscribing
        const subMessage: SubscriptionMessage = {
            type: "subscribe",
            ...subscription
        };
        sendWhenReady(getSocket(), subMessage);
        subscriptions.set(subscription, 1);
        
    } else {
        subscriptions.set(subscription, subscriptionCount+1)
    }
    subscribers.push(subscriber);
};

export const removeSubscriber: (subscriber: Subscriber) => void = (subscriber: Subscriber) => {
    const { callback, ...subscription } = subscriber;
    const UnSubMessage: SubscriptionMessage = {
        type: "unsubscribe",
        ...subscription
    };

    const subscriptionCount = subscriptions.get(subscription);
    if (!subscriptionCount) return;

    if (subscriptionCount === 1) {
        sendWhenReady(getSocket(), UnSubMessage);
        subscriptions.delete(subscription);
    } else {
        subscriptions.set(subscription, subscriptionCount - 1);
    }

    subscribers = subscribers.filter(existing => existing !== subscriber);
};

export function useSocketSubscribe(
    channel: Channel,
    assetId: Asset["id"],
    callback: (response: WsResponse) => void
) {
    const { status } = useSession();

    if ((channel === "openOrders" || channel === "positions") && status !== "authenticated")
        return null;

    useEffect(() => {
        const subscriber = { channel, assetId, callback };
        addSubscriber(subscriber);
        return () => {
            removeSubscriber(subscriber);
        };
    }, []);
}

export function getSubscribers(): readonly Subscriber[]{
    return subscribers;
}