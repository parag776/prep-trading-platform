import { Asset } from "@/generated/prisma";
import { useEffect, useRef, useState } from "react";
import { Loadable, TradeLite, TradeResponse, WsResponse } from "@/lib/common/types";
import axios from "axios";
import { StateCreator } from "zustand";
import { addSubscriber, removeSubscriber, Subscriber, useSocketSubscribe } from "./socket";
import { getUpdatedTradebook, TradeBook } from "../utils/tradebook";
import configData from "../../../../config.json";
import { useStore } from "./store";
import { Store, TradebookSlice } from "./types";

export const createTradebookSlice: StateCreator<Store, [], [], TradebookSlice> = (set) => ({
	tradebook: null,
	ltp: null,
	fetchTradebook: async (asset: Asset) => {
		try {
			const data: Array<TradeLite> = (await axios.get(`/api/trade_history?symbol=${asset.symbol}&limit=${configData.trade_book_size}`)).data;
			set(() => ({
				tradebook: {
					maxTradeBookSize: configData.trade_book_size,
					trades: data,
				},
				ltp: data[0].price,
			}));
		} catch (e) {
			throw new Error("Tradebook fetching went wrong: " + (e instanceof Error ? e.message : String(e)));
		}
	},
	updateTradebook: (updates: Array<TradeResponse>) => {
		set((state) => {
			if (state.tradebook) {
				const tradebook = getUpdatedTradebook(state.tradebook, updates);
				return { tradebook, ltp: updates.length ? updates[0].price : state.ltp };
			} else {
				return {};
			}
		});
	},
});

const useInitializeTradebook = (asset: Asset): "error" | "ready" => {
	const [status, setStatus] = useState<"error" | "ready">("ready");

	const fetchTradebook = useStore((state) => state.fetchTradebook);
	const updateTradebook = useStore((state) => state.updateTradebook);

	const subscriber: Subscriber = {
		channel: "tradebook",
		assetId: asset.id,
		callback: (response: WsResponse) => {
			if (response.channel === "tradebook") {
				updateTradebook(response.message);
			}
		},
	};

	const initializeTradebook = async () => {
		try {
			addSubscriber(subscriber);
			await fetchTradebook(asset);
		} catch (e) {
			console.error(e);
			setStatus("error");
		}
	};

	useEffect(() => {
		initializeTradebook();
		return () => removeSubscriber(subscriber);
	}, [asset.id]);

	return status;
};

const useTradebook = (): Loadable<TradeBook> => {
	const tradebook = useStore((state) => state.tradebook);
	if (tradebook) return { status: "ready", data: tradebook };
	return { status: "loading" };
};
