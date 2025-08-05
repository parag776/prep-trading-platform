import type { Asset } from "../../../../backend/src/generated/prisma";
import { useEffect, useState } from "react";
import type { Loadable, LoadStatus, WsResponse } from "../../../../shared/types.mjs";
import { addSubscriber, removeSubscriber, type Subscriber } from "../store/socket";
import type { TradeBook } from "../utils/tradebook";
import { useStore } from "../store/store";

export const useInitializeTradebook = (asset: Loadable<Asset>): LoadStatus => {
	const [status, setStatus] = useState<LoadStatus>("loading");
	const fetchTradebook = useStore((state) => state.fetchTradebook);
	const updateTradebook = useStore((state) => state.updateTradebook);

	useEffect(() => {
		if (asset.status === "ready") {
			const subscriber: Subscriber = {
				channel: "tradebook",
				assetId: asset.data.id,
				callback: (response: WsResponse) => {
					if (response.channel === "tradebook") {
						updateTradebook(response.message);
					}
				},
			};

			const initializeTradebook = async () => {
				try {
					await fetchTradebook(asset.data);
					addSubscriber(subscriber);
					setStatus("ready");
				} catch (e) {
					console.error(e);
					setStatus("error");
				}
			};

			initializeTradebook();
			return () => removeSubscriber(subscriber);
		}
	}, [asset]);

	return status;
};

export const useTradebook = (): Loadable<TradeBook> => {
	const tradebook = useStore((state) => state.tradebook);
	if (tradebook) return { status: "ready", data: tradebook };
	return { status: "loading" };
};

export const useCurrentPrice = (): Loadable<number> => {
	const tradebook = useStore((state) => state.tradebook);
	if (!tradebook) return { status: "loading" };

	if (tradebook.trades.length === 0) return { status: "ready", data: 0 };

	return { status: "ready", data: tradebook.trades[0].price };
};
