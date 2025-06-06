import { Asset } from "@/generated/prisma";
import { WsResponse, Channel } from "@/lib/common/types";
import { createContext, ReactNode, useState, useEffect } from "react";
import { WebSocket } from "ws";
// that channel should also be subscribed for a particular asset id ... fix this....

type Subscriber = {
	channel: Channel;
	assetId: Asset["id"];
	callback: (response: WsResponse) => void;
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
		setSubscribers((subscribers) => [...subscribers, subscriber]);
	};

	const removeSubscriber: (subscriber: Subscriber) => void = (subscriber: Subscriber) =>{
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
