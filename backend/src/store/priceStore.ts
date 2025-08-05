import { Asset } from "../generated/prisma/client.js";
import { getAllAssets } from "./assetStore.js";
import axios from "axios";

let spotPrices: Map<Asset["id"], number>;
let markPrices: Map<Asset["id"], number>;


export async function initializeSpotPrices() {
    try {
        spotPrices = new Map(
            await Promise.all(
                getAllAssets().map(async (asset) => {
                    const res = await axios.get(`https://api4.binance.com/api/v3/ticker/price?symbol=${asset.symbol}USDC`);
                    return [asset.id, Number(res.data.price)] as [Asset["id"], number];
                })
            )
        );
    } catch (e) {
        throw new Error("error fetching spot prices.");
    }
}

export async function initializeMarkPrices() {
	try {
		markPrices = new Map(
			await Promise.all(
				getAllAssets().map(async (asset) => {
					const res = await axios.get(`https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${asset.symbol}USDC`);
					return [asset.id, Number(res.data.markPrice)] as [Asset["id"], number];
				})
			)
		);
	} catch (e) {
        throw new Error("error fetching mark prices.");
	}
}

export async function updateMarkPrice(assetId: Asset["id"], markPrice: number){
    markPrices.set(assetId, markPrice)
}

export async function updateSpotPrice(assetId: Asset["id"], spotPrice: number){
    markPrices.set(assetId, spotPrice)
}

export function getMarkPrice(assetId: Asset["id"]): number {
    const markPrice = markPrices.get(assetId);
    if(markPrice){
        return markPrice
    } else {
        throw new Error("error getting mark price.")
    }
}
export function getSpotPrice(assetId: Asset["id"]): number {
    const spotPrice = markPrices.get(assetId);
    if(spotPrice){
        return spotPrice
    } else {
        throw new Error("error getting spot price.")
    }
}

export function getMarkPricesSnapshot(){
    return structuredClone(markPrices);
}