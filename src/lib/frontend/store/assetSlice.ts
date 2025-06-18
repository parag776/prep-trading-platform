import { Asset } from "@/generated/prisma";
import { Loadable } from "@/lib/common/types";
import axios from "axios";
import { useEffect, useState } from "react";
import { StateCreator } from "zustand";
import { AssetSlice, Store } from "./types";
import { useStore } from "./store";

export const createAssetSlice: StateCreator<Store, [], [], AssetSlice> = (set, get) => ({
	assetMap: null,
	currentAsset: null,
	fetchAllAssets: async () => {
		try {
			const { data }: { data: Array<Asset> } = await axios.get("/api/assets");
			const assets = new Map<Asset["id"], Asset>(data.map((asset) => [asset.id, asset]));
			if (data.length) {
				set(() => ({ assetMap: assets, asset: data[0] }));
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
			const asset = state.assetMap?.get(assetId);
			return { currentAsset: asset ?? null };
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


export const useAsset = (): Loadable<Asset> => {
	const asset = useStore((state) => state.currentAsset);
	if (asset) return { status: "ready", data: asset };
	return { status: "loading" };
};

export const useUpdateAsset = (): AssetSlice["updateCurrentAsset"] => {
	const updateAsset = useStore((state) => state.updateCurrentAsset);
	return updateAsset;
};

export const useAllAssets = (): Loadable<Array<Asset>> => {
	const assetMap = useStore((state) => state.assetMap);
	if (assetMap) {
		return { status: "ready", data: Array.from(assetMap.values()) };
	} else {
		return { status: "loading" };
	}
};

export const useFetchAllAssets = (): "error" | "ready" => {
	const [status, setStatus] = useState<"error" | "ready">("ready");
	const fetchAllAssets = useStore((s) => s.fetchAllAssets);

	useEffect(() => {
		(async () => {
			try {
				await fetchAllAssets();
			} catch (e) {
				console.error(e);
				setStatus("error");
			}
		})();
	}, []);

	return status;
};
