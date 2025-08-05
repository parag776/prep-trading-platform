import { Asset, Resolution, Trade } from "../generated/prisma/client.js";
import { Candle, LatestCandleByAssetAndResolution } from "../types.js";
import { getAllAssets } from "./assetStore.js";
import { getLatestCandleFromDB } from "../database.js";
import { resolutionInfo } from "../../../shared/data.mjs";

// important note! don't forget to stringify the assetId and resolution, apparantly javascript doesn't have a hashing function.....UGH!!

export let latestCandles: LatestCandleByAssetAndResolution;

export async function initializeLatestCandles() {
	latestCandles = new Map<string, Candle>();
	for (const asset of getAllAssets()) {
		for (const resolution of Object.values(Resolution)) {
			const data = await getLatestCandleFromDB(asset.id, resolution);
			// creating a default candle, creating here and not outside, because of bugs it can cause (since heap alocated).
			const defaultCandle: Candle = {
				timestamp: new Date(0),
				open: 0,
				high: 0,
				low: Math.max(),
				close: 0,
				volume: 0,
			};
			setLatestCandle(asset.id, resolution, data || defaultCandle);
		}
	}
}

export function getLatestCandle(assetId: Asset["id"], resolution: Resolution) {
	const candle = latestCandles.get(JSON.stringify({ assetId, resolution }));
	if (candle) {
		return candle;
	} else {
		throw new Error(`error getting latest candle for assetId -> ${assetId} and resolution -> ${resolution}`);
	}
}

export function setLatestCandle(assetId: Asset["id"], resolution: Resolution, candle: Candle) {
	latestCandles.set(JSON.stringify({ assetId, resolution }), candle);
}

// seeing if the candle is past their life, if not adjust it and if it is then create a new candle.
export function adjustCandle(assetId: Asset["id"], resolution: Resolution, trade: Trade) {
	const currentCandle = getLatestCandle(assetId, resolution);
	const duration = resolutionInfo.get(resolution)!.duration;
	const tradetime = trade.createdAt.getTime();


	const candleStartTimestamp = Math.floor(tradetime / duration) * duration;

	if (currentCandle.timestamp.getTime() < candleStartTimestamp) {
		currentCandle.timestamp = new Date(candleStartTimestamp);
		currentCandle.open = trade.price;
		currentCandle.high = trade.price;
		currentCandle.low = trade.price;
		currentCandle.close = trade.price;
		currentCandle.volume = trade.quantity;
	} else {
		currentCandle.close = trade.price;
		currentCandle.high = Math.max(currentCandle.high, trade.price);
		currentCandle.low = Math.min(currentCandle.low, trade.price);
		currentCandle.volume += trade.quantity;
	}
}

export function getContractPrice(assetId: Asset["id"]) {
	return getLatestCandle(assetId, Resolution.ONE_MINUTE).close;
}
