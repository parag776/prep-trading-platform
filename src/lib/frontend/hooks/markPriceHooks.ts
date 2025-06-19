import { Asset } from "@/generated/prisma";
import { Loadable } from "@/lib/common/types";
import { useStore } from "../store/store";

export function useMarkPrice(asset: Asset): Loadable<number> {
	const markPrice = useStore((state) => state.markPrices?.get(asset.id));
	if (markPrice) return { status: "ready", data: markPrice };
	return { status: "loading" };
}

export function useMarkPrices(): Loadable<Map<Asset["id"], number>> {
	const markPrices = useStore((state)=> state.markPrices);
	if(markPrices) return {status: "ready", data: markPrices};
	return {status: "loading"};
	
}