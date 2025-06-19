import { Asset } from "@/generated/prisma";
import { PositionDiffResponse } from "@/lib/common/types";
import axios from "axios";
import {  StateCreator } from "zustand";
import { MarkPriceSlice, Store } from "./types";

const markPriceConnections = new Map<Asset["id"], WebSocket>();

export const createMarkPriceSlice: StateCreator<Store, [], [], MarkPriceSlice> = (set, get) => ({
	markPrices: null,
	updateMarkPrice: (asset: Asset, price: number) => {
		set((state) => {
			const newPrices = new Map(state.markPrices);
			newPrices.set(asset.id, price);
			return { markPrices: newPrices };
		});
	},
	removeMarkPrice: (asset: Asset) => {
		set((state) => {
			const newPrices = new Map(state.markPrices);
			newPrices.delete(asset.id);
			return { markPrices: newPrices };
		});
	},
	fetchMarkPrices: async () => {
		try {
			const positions = get().positions;

			if (positions) {
				const markPricesArray = await Promise.all(
					positions.map(async (position) => {
						const asset = get().assetMap?.get(position.assetId);
						if (!asset) {
							throw new Error("please fetch the assets before fetching markprices.");
						}
						const response = await axios.get("https://fapi.binance.com/fapi/v1/premiumIndex", {
							params: { symbol: asset.symbol + "USDC" },
						});
						return [asset.id, parseFloat(response.data.markPrice)] as [string, number];
					})
				);
				set(() => ({
					markPrices: new Map(markPricesArray),
				}));
			} else {
				throw new Error("please fetch positions before fetching markprices.");
			}
		} catch (e) {
			throw new Error("Error fetching markPrices: " + (e instanceof Error ? e.message : String(e)));
		}
	},
	subscribeToMarkPrice(asset: Asset) {
		const symbol = asset.symbol + "USDC";
		let retries = 0;

		const connect = () => {
			const ws = new WebSocket(`wss://fstream.binance.com/ws/${symbol}@markPrice`);
			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);
				const markPrice = parseFloat(data.p); // `p` = mark price
				get().updateMarkPrice(asset, markPrice);
			};

			ws.onopen = (event) => {
				markPriceConnections.set(asset.id, ws);
				retries = 0;
			};

			ws.onclose = (event) => {
				const { code } = event;
				if (code === 1006) {
					if (retries < 5) {
						const timeout = 1000 * Math.pow(2, retries);
						retries++;
						setTimeout(() => connect(), timeout);
					} else {
						console.error(`Max retries reached for ${symbol}`);
					}
				}
			};
		};
		connect();
	},

	unsubscribeToMarkPrice(asset: Asset) {
		const assetId = asset.id;
		const ws = markPriceConnections.get(assetId);
		if (ws) {
			ws.close();
			get().removeMarkPrice(asset);
		}
	},
	syncMarkPriceConnectionsWithPositionUpdates(updates: Array<PositionDiffResponse>) {
		for (const update of updates) {
			const asset = get().getAsset(update.assetId);
			if (!asset) continue;

			if (update.quantity === 0) {
				get().unsubscribeToMarkPrice(asset);
			} else {
				if (!get().markPrices?.has(asset.id)) {
					get().subscribeToMarkPrice(asset);
				}
			}
		}
	},
});