import { Asset } from "@/generated/prisma";
import { WsResponse, Channel, SubscribeMessage } from "@/lib/common/types";
import { createContext, ReactNode, useState, useEffect } from "react";
import { WebSocket } from "ws";
// that channel should also be subscribed for a particular asset id ... fix this....


type Subscription = {
	channel: Channel;
	assetId: Asset["id"];
}

type Subscriber = Subscription & {callback: (response: WsResponse) => void
};


type SocketSubscribeContextValue = {
	socket: WebSocket;
	addSubscriber: (subscriber: Subscriber) => void;
	removeSubscriber: (subscriber: Subscriber) => void;
};

export const SocketSubscribeContext = createContext<SocketSubscribeContextValue | null>(null);

export function SocketSubscribeProvider({ children }: { children: ReactNode }) {
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [subscribers, setSubscribers] = useState<Array<Subscriber>>([]);
	const [subscriptions, setSubscriptions] = useState<Map<Subscription, number>>(new Map<Subscription, number>());

	useEffect(() => {
		const socket = new WebSocket("url");
		setSocket(socket);

		socket.onopen = () => {
			console.log("connected to socket successfully");
		};

		socket.onmessage = (messageEvent) => {
			const response: WsResponse = JSON.parse(messageEvent.data.toString());
			const callbacks = subscribers.filter(
				(subscriber) =>
					subscriber.channel === response.channel &&
					subscriber.assetId === response.assetId
			);

			callbacks.map(({ callback }) => callback(response));
		};

		return () => {
			socket.close();
		};
	}, []);

	const addSubscriber: (subscriber: Subscriber) => void = (subscriber: Subscriber) => {

		const {channel, assetId} = subscriber;

		const subscriptionCount = subscriptions.get({channel, assetId})
		if(!subscriptionCount){

			// subscribing
			const subMessage: SubscribeMessage = {
				type: "subscribe",
				channel,
				assetId,
			};
			socket?.send(JSON.stringify(subMessage));
			
			// 
			setSubscriptions((subscriptions)=>{
				const newSubscriptions = structuredClone(subscriptions);
				newSubscriptions.set({channel, assetId}, 1);
				return newSubscriptions
			})
		} else {
			setSubscriptions((subscriptions)=>{
				const newSubscriptions = structuredClone(subscriptions);
				newSubscriptions.set({channel, assetId}, subscriptionCount+1);
				return newSubscriptions
			})
		}
		setSubscribers((subscribers) => [...subscribers, subscriber]);
	};

	const removeSubscriber: (subscriber: Subscriber) => void = (subscriber: Subscriber) =>{
		
		const {channel, assetId} = subscriber;
		const UnSubMessage: SubscribeMessage = {
			type: "unsubscribe",
			channel,
			assetId,
		};

		const subscriptionCount = subscriptions.get({channel, assetId})
		if(!subscriptionCount) return;

		if(subscriptionCount===1){

			socket?.send(JSON.stringify(UnSubMessage));

			setSubscriptions((subscriptions)=>{
				const newSubscriptions =  structuredClone(subscriptions);
				newSubscriptions.delete({channel, assetId});
				return newSubscriptions;
			})
		} else {
			const newSubscriptions =  structuredClone(subscriptions);
			newSubscriptions.set({channel, assetId}, subscriptionCount-1);
			return newSubscriptions;
		}

		setSubscribers((subscribers) => {
			const newSubscribers = [];
			for(const cur of subscribers){
				if(cur===subscriber) continue;
				newSubscribers.push(cur)
			}
			return newSubscribers
		})
	}

	if (!socket) return null;

	return (
		<SocketSubscribeContext.Provider value={{ socket, addSubscriber, removeSubscriber }}>
			{children}
		</SocketSubscribeContext.Provider>
	);
}
