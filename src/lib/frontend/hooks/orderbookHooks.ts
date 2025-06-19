import { Asset } from "@/generated/prisma";
import { addSubscriber, removeSubscriber, Subscriber } from "../store/socket";
import { useStore } from "../store/store";
import { useEffect, useState } from "react";
import { Loadable, OrderBookLite, WsResponse } from "@/lib/common/types";
import { getDecimalPrecision } from "../utils/misc";


export const useInitializeOrderbook = (asset: Asset): "error" | "ready" => {
	const [status, setStatus] = useState<"error" | "ready">("ready");

	const fetchOrderbook = useStore((state) => state.fetchOrderbook);
	const updateOrderbook = useStore((state) => state.updateOrderbook);

	const subscriber: Subscriber = {
		channel: "orderbook",
		assetId: asset.id,
		callback: (response: WsResponse) => {
			if (response.channel === "orderbook") {
				updateOrderbook(response.message);
			}
		},
	};

	const initializeOrderbook = async () => {
		try {
			addSubscriber(subscriber);
			await fetchOrderbook(asset);
		} catch (e) {
			console.error(e);
			setStatus("error");
		}
	};

	useEffect(() => {
		initializeOrderbook();
		return () => removeSubscriber(subscriber);
	}, [asset.id]);

	return status;
};

export const useOrderbook = (): Loadable<OrderBookLite> => {
	const orderbook = useStore((state) => state.orderbook);
	if (orderbook) return { status: "ready", data: orderbook };
	return { status: "loading" };
};

export const useDecimalPrecision = ()=>{
  return useStore((state) => getDecimalPrecision(state.orderbook));
}