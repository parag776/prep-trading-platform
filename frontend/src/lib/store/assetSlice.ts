import axios from "axios";
import type { StateCreator } from "zustand";
import type { Asset } from "../../../../backend/src/generated/prisma";
import type { AssetSlice, Store } from "./types";
import configData from "../../../../shared/config.mjs";
import { addSubscriber, type Subscriber } from "./socket";
import type { WsResponse } from "../../../../shared/types.mts";

export const createAssetSlice: StateCreator<Store, [], [], AssetSlice> = (set, get) => ({
	assetMap: null,
	currentAsset: null,
	fundingMap: null,

	initializeAllAssets: async () => {
		try {
			const { data }: { data: Array<Asset> } = await axios.get(`/api/asset/all`);
			if (data.length) {
				const assetMap = new Map<Asset["id"], Asset>(data.map((asset) => [asset.id, asset]));
				const fundingMap = new Map<Asset["id"], number>(data.map((asset) => [asset.id, configData.interest_rate]));
				set(() => ({ assetMap, fundingMap, currentAsset: data[0] }));
				get().subscribeToMarkPrice(data[0]);
				
				// will add subscriber here for funding...
				for(const asset of data){
					const subscriber: Subscriber = {
						channel: "fundingRate",
						assetId: asset.id,
						callback: (response: WsResponse) => {
							if (response.channel === "fundingRate") {
								get().updateFundingRate(response.assetId, response.message.fundingRate);
							}
						},
					};
					addSubscriber(subscriber);
				}

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

			if (state.currentAsset) get().unsubscribeToMarkPrice(state.currentAsset);
			if (newAsset) get().subscribeToMarkPrice(newAsset);

			return { currentAsset: newAsset ?? null };
		});
	},
	getAsset: (assetId: Asset["id"]): Asset | null => {
		return get().assetMap?.get(assetId) ?? null;
	},
	getAssetBySymbol: (symbol: Asset["symbol"]): Asset | null => {
		const assetMap = get().assetMap;
		if (!assetMap) {
			return null;
		}
		const assets = Array.from(assetMap.values());
		return assets.find((asset) => asset.symbol === symbol) ?? null;
	},
	updateFundingRate: (assetId: Asset["id"], fundingRate: number) =>{
		set((state)=>{
			const newFundingMap = new Map(state.fundingMap);
			newFundingMap.set(assetId, fundingRate);
			return {fundingMap: newFundingMap};
		})
	}
});
