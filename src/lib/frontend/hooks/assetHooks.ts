import { Asset } from "@/generated/prisma";
import { Loadable, LoadStatus } from "@/lib/common/types";
import { useEffect, useState } from "react";
import { AssetSlice } from "../store/types";
import { useStore } from "../store/store";

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
		return {status: "ready", data: Array.from(assetMap.values())};
	} else {
		return {status: "loading"};
	}
};

export const useFetchAllAssets = (): LoadStatus => {
	const [status, setStatus] = useState<LoadStatus>("loading");
	const fetchAllAssets = useStore((state) => state.fetchAllAssets);

	useEffect(() => {
		(async () => {
			try {
				await fetchAllAssets();
				setStatus("ready");
			} catch (e) {
				console.error(e);
				setStatus("error");
			}
		})();
	}, []);

	return status;
};
