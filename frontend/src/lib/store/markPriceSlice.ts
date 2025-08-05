import axios from "axios";
import type { StateCreator } from "zustand";
import type { Asset } from "../../../../backend/src/generated/prisma";
import type { PositionDiffResponse } from "../../../../shared/types.mjs";
import type { MarkPriceSlice, Store } from "./types";

const markPriceConnections = new Map<Asset["id"], { ws: WebSocket; subscriptionCount: number }>();

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
	initializePositionMarkPrices: async () => {
		try {
			const positions = get().positions;

			if (positions) {

				// fetch mark prices for each position
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

				// subscribe to mark prices for each position
				positions.forEach((position) => {
					const asset = get().getAsset(position.assetId)!; // asset is guaranteed to be defined because we fetched the assets and positions
					get().subscribeToMarkPrice(asset);
				});
			} else {
				throw new Error("please fetch assets and positions before fetching markprices.");
			}
		} catch (e) {
			throw new Error("Error fetching markPrices: " + (e instanceof Error ? e.message : String(e)));
		}
	},
	subscribeToMarkPrice(asset: Asset) {
		const assetId = asset.id;
		const connectionData = markPriceConnections.get(assetId);
		if (connectionData) {
			connectionData.subscriptionCount++;
			return;
		}

		// fetching initial mark price. (it is being done because ws's first markPrice is a little slow.)
		axios.get("https://fapi.binance.com/fapi/v1/premiumIndex", {
			params: { symbol: asset.symbol + "USDC" },
		}).then((response)=>{
			get().updateMarkPrice(asset, parseFloat(response.data.markPrice));
		})

		const symbol = asset.symbol.toLowerCase() + "usdc";
		let retries = 0;

		const connect = () => {
			const ws = new WebSocket(`wss://fstream.binance.com/ws/${symbol}@markPrice`);
			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);
				const markPrice = parseFloat(data.p); // `p` = mark price
				get().updateMarkPrice(asset, markPrice);
			};

			ws.onopen = (event) => {
				markPriceConnections.set(assetId, { ws, subscriptionCount: 1 });
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
		const connectionData = markPriceConnections.get(assetId);
		if (connectionData) {
			let { ws, subscriptionCount } = connectionData;
			if (subscriptionCount === 1) {
				ws.close();
				get().removeMarkPrice(asset);
				markPriceConnections.delete(assetId);
			} else {
				subscriptionCount--;
				markPriceConnections.set(assetId, { ws, subscriptionCount });
			}
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
