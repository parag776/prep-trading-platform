import type { Asset } from "../../../../backend/src/generated/prisma";
import type { Loadable, LoadStatus } from "../../../../shared/types.mjs";
import { useEffect, useMemo, useState } from "react";
import type { AssetSlice } from "../store/types";
import { useStore } from "../store/store";

export const useAsset = (): Loadable<Asset> => {
	const asset = useStore((state) => state.currentAsset);
	return useMemo(() => {
		if (asset) return { status: "ready", data: asset };
		return { status: "loading" };
	}, [asset]);
};

export const useUpdateAsset = (): AssetSlice["updateCurrentAsset"] => {
	const updateAsset = useStore((state) => state.updateCurrentAsset);
	return updateAsset;
};

export const useAllAssets = (): Loadable<Array<Asset>> => {
	const assetMap = useStore((state) => state.assetMap);

	return useMemo(()=>{
		if (assetMap) {
			return { status: "ready", data: Array.from(assetMap.values()) };
		} else {
			return { status: "loading" };
		}
	}, [assetMap])
};

export const useInitializeAllAssets = (): LoadStatus => {
	const [status, setStatus] = useState<LoadStatus>("loading");
	const initializeAllAssets = useStore((state) => state.initializeAllAssets);

	useEffect(() => {
		(async () => {
			try {
				await initializeAllAssets();
				setStatus("ready");
			} catch (e) {
				console.error(e);
				setStatus("error");
			}
		})();
	}, []);

	return status;
};

export const useAllFundingRates = (): Loadable<Map<string, number>> => {
	const fundingRateMap = useStore((state)=>state.fundingMap);
	return useMemo(()=>{
		if(fundingRateMap){
			return {status: "ready", data: fundingRateMap};	
		} else {
			return {status: "loading"};
		}
	}, [fundingRateMap])
}

export const useCurrentFundingRate = (): Loadable<number> => {
	const asset = useStore((state) => state.currentAsset);
	const fundingRate = useStore((state)=>asset?state.fundingMap?.get(asset.id):null);

	return useMemo(()=>{
		if (fundingRate) return { status: "ready", data: fundingRate };
		return { status: "loading" };
	}, [fundingRate])
}

export const useFundingRate = (assetId: Asset["id"]): Loadable<number> => {
	const fundingRate = useStore((state)=>state.fundingMap?.get(assetId));
	return useMemo(()=>{
		if(fundingRate){
			return {status: "ready", data: fundingRate};
		} else {
			return {status: "loading"};
		}
	}, [fundingRate])
}