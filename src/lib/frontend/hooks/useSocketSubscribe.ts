import {
	Channel,
	SubscribeMessage,
    WsResponse,
} from "@/lib/common/types";
import { useSession } from "next-auth/react";
import { useContext, useEffect } from "react";
import { SocketSubscribeContext } from "../context/SocketSubscribeContext";
import { Asset } from "@/generated/prisma";

// this will take channel rather than subscibe message.
// asset id should come from context. ofc, auth indeed comes from context itself.
export function useSocketSubscribe(
	channel: Channel,
	assetId: Asset["id"],
	callback: (response: WsResponse) => void
) {
	const { status } = useSession();
	const SocketSubscribeContextValue = useContext(SocketSubscribeContext);
	if (!SocketSubscribeContextValue) return null;

	if ((channel === "openOrders" || channel === "positions") && status !== "authenticated")
		return null;

	const { socket, addSubscriber, removeSubscriber } = SocketSubscribeContextValue;

	useEffect(() => {

        const subMessage: SubscribeMessage = {
            type: "subscribe",
            channel,
            assetId,
        };

        const unSubMessage: SubscribeMessage = {...subMessage, type: "unsubscribe" };

        const subscriber = {channel, assetId, callback};

		socket.send(JSON.stringify(subMessage));
		addSubscriber(subscriber);

		return () => {
			socket.send(JSON.stringify(unSubMessage));
            removeSubscriber(subscriber);
		};
	}, []);
}
