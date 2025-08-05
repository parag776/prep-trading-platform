import type { Asset } from "../../../../backend/src/generated/prisma";
import { addSubscriber, removeSubscriber, type Subscriber } from "../store/socket";	
import { useStore } from "../store/store";
import { useEffect, useState } from "react";
import type { Loadable, LoadStatus, OrderBookLite, WsResponse } from "../../../../shared/types.mjs";
import { getDecimalPrecision } from "../utils/misc";

export const useInitializeOrderbook = (asset: Loadable<Asset>): LoadStatus => {
	const [status, setStatus] = useState<LoadStatus>("loading");

	const fetchOrderbook = useStore((state) => state.fetchOrderbook);
	const updateOrderbook = useStore((state) => state.updateOrderbook);

	useEffect(() => {
		if (asset.status === "ready") {
			const subscriber: Subscriber = {
				channel: "orderbook",
				assetId: asset.data.id,
				callback: (response: WsResponse) => {
					if (response.channel === "orderbook") {
						updateOrderbook(response.message);
					}
				},
			};
			const initializeOrderbook = async () => {
				try {
					addSubscriber(subscriber);
					await fetchOrderbook(asset.data);
					setStatus("ready");
				} catch (e) {
					console.error(e);
					setStatus("error");
				}
			};
			initializeOrderbook();
			return () => removeSubscriber(subscriber);
		}
	}, [asset]);

	return status;
};

export const useOrderbook = (): Loadable<OrderBookLite> => {
	const orderbook = useStore((state) => state.orderbook);
	if (orderbook) return { status: "ready", data: orderbook };
	return { status: "loading" };
};

export const useDecimalPrecision = () => {
	const orderbook = useOrderbook();
	return getDecimalPrecision(orderbook.status==="ready"?orderbook.data:null);
};
