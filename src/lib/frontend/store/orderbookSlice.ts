import { Asset } from "@/generated/prisma";
import { useEffect, useState } from "react";
import { Loadable, OrderbookDiffResponse, OrderBookLite, WsResponse } from "@/lib/common/types";
import axios from "axios";
import { create, StateCreator } from "zustand";
import { addSubscriber, removeSubscriber, Subscriber, useSocketSubscribe } from "./socket";
import { getUpdatedOrderbook } from "../utils/orderbook";
import { useStore } from "./store";
import { OrderbookSlice, Store } from "./types";
import { getDecimalPrecision } from "../utils/misc";



export const createOrderbookSlice: StateCreator<Store, [], [], OrderbookSlice> = (set) => ({
	orderbook: null,
	fetchOrderbook: async (asset: Asset) => {
		try {
			const data: OrderBookLite = (await axios.get(`/api/orderbook?symbol=${asset.symbol}`)).data;
			set(() => ({ orderbook: data }));
		} catch (e) {
			throw new Error("Orderbook fetching went wrong: " + (e instanceof Error ? e.message : String(e)));
		}
	},
	updateOrderbook: (updates: Array<OrderbookDiffResponse>) => {
		set((state) => {
			if (state.orderbook) {
				const orderbook = getUpdatedOrderbook(state.orderbook, updates);
				return { orderbook };
			} else {
				return {};
			}
		});
	},
});

const useInitializeOrderbook = (asset: Asset): "error" | "ready" => {
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

const useOrderbook = (): Loadable<OrderBookLite> => {
	const orderbook = useStore((state) => state.orderbook);
	if (orderbook) return { status: "ready", data: orderbook };
	return { status: "loading" };
};

const useDecimalPoints = ()=>{
  useStore((state) => getDecimalPrecision(state.orderbook));
}