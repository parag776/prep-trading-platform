import { Asset } from "@/generated/prisma";
import { Loadable } from "@/lib/common/types";
import axios from "axios";
import { useEffect, useState } from "react";
import { create } from "zustand";

type AssetStore = {
	assetMap: Map<Asset["symbol"], Asset>;
	asset: Asset | null;
	fetchAllAssets: () => void;
	updateAsset: (symbol: Asset["symbol"]) => void;
};

const useAssetStore = create<AssetStore>((set) => ({
	assetMap: new Map<Asset["symbol"], Asset>(),
	asset: null,
	fetchAllAssets: async () => {
		const { data }: { data: Array<Asset> } = await axios.get("/api/assets");
		const assets = new Map<Asset["symbol"], Asset>(data.map((asset) => [asset.symbol, asset]));
		if (data.length) { set(() => ({ asset: data[0] }))}
		set(() => ({ assetMap: assets }));
	},
	updateAsset: (symbol) => {
		set((state) => {
			const asset = state.assetMap.get(symbol);
			return { asset: asset ?? null };
		});
	},
}));

export const getAsset = (assetId: Asset["id"]): Asset | null => {
	return useAssetStore.getState().assetMap.get(assetId) ?? null;
}

export const useAsset = (): Loadable<Asset> => {
	const asset = useAssetStore((state) => state.asset);
    if(asset) return {status: "ready", data: asset};
	return {status: "loading"};
};

export const useUpdateAsset = (): AssetStore["updateAsset"] => {
	const updateAsset = useAssetStore((state) => state.updateAsset);
	return updateAsset;
};

export const useAllAssets = (): Array<Asset> => {
	const assetMap = useAssetStore((state) => state.assetMap);
	return Array.from(assetMap.values());
};

export const useFetchAllAssets = (): "error" | "ready" => {
    
    const [status, setStatus] = useState<"error" | "ready">("ready");
	const fetchAllAssets = useAssetStore((s) => s.fetchAllAssets);
	useEffect(() => {
        try{
		    fetchAllAssets();
        } catch(e) {
            console.error(e);
            setStatus("error");
        }
	}, []);

    return status;
};
