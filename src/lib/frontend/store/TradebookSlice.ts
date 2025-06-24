import { Asset } from "@/generated/prisma";
import { TradeLite, TradeResponse} from "@/lib/common/types";
import axios from "axios";
import { StateCreator } from "zustand";
import { getUpdatedTradebook } from "../utils/tradebook";
import configData from "../../../../config.json";
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
				ltp: data.at(0)?.price ?? 0,
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

