import { Asset } from "@/generated/prisma";
import { useEffect, useState } from "react";
import { Loadable, OrderbookDiffResponse, OrderBookLite,WsResponse } from "@/lib/common/types";
import axios from "axios";
import { create } from "zustand";
import { addSubscriber, removeSubscriber, Subscriber, useSocketSubscribe } from "./socket";
import { getUpdatedOrderbook } from "../utils/orderbook";

type OrderbookStore = {
	orderbook: OrderBookLite | null;
	fetchOrderbook: (asset: Asset) => Promise<void>;
	updateOrderbook: (updates: Array<OrderbookDiffResponse>) => void;
};

const useOrderbookStore = create<OrderbookStore>((set) => ({
	orderbook: null,
	fetchOrderbook: async (asset: Asset) => {
        try{
            const data: OrderBookLite = (await axios.get(`/api/orderbook?symbol=${asset.symbol}`)).data;
            set(() => ({ orderbook: data, }));
        } catch(e){
            throw new Error("orderbook fetching went wrong");
        }
	},
	updateOrderbook: (updates: Array<OrderbookDiffResponse>) => {
		set((state) => {
			if (state.orderbook) {
				const orderbook = getUpdatedOrderbook(state.orderbook, updates);
				return {orderbook};
			} else {
				return {};
			}
		});
	},
}));

const useInitializeOrderbook = (asset: Asset): "error" | "ready" => {
	const [status, setStatus] = useState<"error" | "ready">("ready");

	const fetchOrderbook = useOrderbookStore((state) => state.fetchOrderbook);
	const updateOrderbook = useOrderbookStore((state) => state.updateOrderbook);

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

const useOrderbook = (): Loadable<OrderBookLite> => {
	const orderbook = useOrderbookStore((state) => state.orderbook);
	if (orderbook) return { status: "ready", data: orderbook };
	return { status: "loading" };
};
