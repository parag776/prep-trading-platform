import { Asset } from "@/generated/prisma";
import { Loadable, PositionDiffResponse } from "@/lib/common/types";
import axios from "axios";
import { useEffect } from "react";
import { create } from "zustand";
import { Subscriber } from "./socket";
import { getAsset } from "./assetStore";


type MarkPriceStore = {
	markPrices: Map<Asset["id"], number>;
	updatePrice: (asset: Asset, price: number) => void;
	removeAsset: (asset: Asset) => void;
	subscribe: (asset: Asset) => void;
	unsubscribe: (asset: Asset) => void;
};


const fetchMarkPrice = async (assetId: string) => {
	try {
		const res = await axios.get(`https://fapi.binance.com/fapi/v1/premiumIndex`, {
			params: { symbol: assetId + "USDC" },
		});

		return parseFloat(res.data.markPrice); // markPrice is a string
	} catch (err) {
		console.error("Failed to fetch mark price:", err);
		return null;
	}
};

const markPriceConnections = new Map<Asset["id"], WebSocket>();

const useMarkPriceStore = create<MarkPriceStore>((set, get) => ({
	markPrices: new Map(),
	updatePrice: (asset: Asset, price: number) => {
		set((state) => {
			const newPrices = new Map(state.markPrices);
			newPrices.set(asset.id, price);
			return { markPrices: newPrices };
		});
	},
	removeAsset: (asset: Asset) => {
		set((state) => {
			const newPrices = new Map(state.markPrices);
			newPrices.delete(asset.id);
			return { markPrices: newPrices };
		});
	},
	subscribe(asset: Asset) {
		const symbol = asset.symbol + "USDC";
		let retries = 0;

		const connect = () => {
			const ws = new WebSocket(`wss://fstream.binance.com/ws/${symbol}@markPrice`);
			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);
				const markPrice = parseFloat(data.p); // `p` = mark price
				useMarkPriceStore.getState().updatePrice(asset, markPrice);
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
	unsubscribe(asset: Asset) {
		const assetId = asset.id;
		const ws = markPriceConnections.get(assetId);
		if (ws) {
			ws.close();
			useMarkPriceStore.getState().removeAsset(asset);
		}
	},
}));

export function syncMarkPriceConnectionsWithPositionUpdates(updates: Array<PositionDiffResponse>){
	for(const update of updates){
		const asset = getAsset(update.assetId);
		if(!asset) continue;
		
		if(update.quantity === 0){
			useMarkPriceStore.getState().unsubscribe(asset);
		} else {
			if(!useMarkPriceStore.getState().markPrices.has(asset.id)){
				useMarkPriceStore.getState().subscribe(asset);
			}
		}
	}
}	

function useMarkPrice(asset: Asset): Loadable<number> {
	const markPrice = useMarkPriceStore((state) => state.markPrices.get(asset.id));
	if(markPrice) return {status: "ready", data: markPrice};
	return {status: "loading"};
}
