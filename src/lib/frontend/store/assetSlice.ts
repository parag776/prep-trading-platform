import { Asset } from "@/generated/prisma";
import axios from "axios";
import { StateCreator } from "zustand";
import { AssetSlice, Store } from "./types";

export const createAssetSlice: StateCreator<Store, [], [], AssetSlice> = (set, get) => ({
	assetMap: null,
	currentAsset: null,
	fetchAllAssets: async () => {
		try {
			const { data }: { data: Array<Asset> } = await axios.get("/api/assets");
			const assetMap = new Map<Asset["id"], Asset>(data.map((asset) => [asset.id, asset]));
			if (data.length) {
				set(() => ({ assetMap, currentAsset: data[0] }));
				get().subscribeToMarkPrice(data[0]);
			} else {
				console.error("assets are being returned empty.");
				throw new Error("fetching assets went wrong.");
			}
		} catch (e) {
			throw new Error("fetching assets went wrong: " + (e instanceof Error ? e.message : String(e)));
		}
	},
	updateCurrentAsset: (assetId) => {
		set((state) => {
			const newAsset = state.assetMap?.get(assetId);

			if(state.currentAsset) get().unsubscribeToMarkPrice(state.currentAsset);
			if(newAsset) get().subscribeToMarkPrice(newAsset);

			return { currentAsset: newAsset ?? null };
		});
	},
	getAsset: (assetId: Asset["id"]): Asset | null => {
		return get().assetMap?.get(assetId) ?? null;
	},
	getAssetBySymbol: (symbol: Asset["symbol"]): Asset | null =>{
		const assets = get().assetMap?.values();
		return assets?.find((asset)=>asset.symbol===symbol) ?? null;
	},
});