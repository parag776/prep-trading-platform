import { Asset } from "../generated/prisma/client.js";
import { getAssetsFromDB } from "../database.js";
let assets: Asset[];
let symbolToAssetId: Map<Asset["symbol"], Asset["id"]>;

export async function initializeAssets() {
    assets = await getAssetsFromDB()
    symbolToAssetId = new Map(assets.map((asset) => [asset.symbol, asset.id]));
}

export function getAllAssets(): Readonly<Asset[]> {
	return assets;
}

export function getAssetFromId(assetId: string): Readonly<Asset> {
	const asset = assets.find((asset) => asset.id === assetId);
    if(!asset){
        throw new Error("invalid asset id");
    }
    return asset;
}

export function getAssetFromSymbol(symbol: string): Readonly<Asset>{
	const asset = assets.find((asset) => asset.symbol === symbol);
    if(!asset){
        throw new Error("invalid asset symbol");
    }
    return asset;
}

export function getSymbolFromAssetId(assetId: string): Asset["symbol"]{
	const symbol = assets.find((asset) => asset.id === assetId)?.symbol;
    if(!symbol){
        throw new Error("invalid asset id");
    }
    return symbol;
}

export function isValidSymbol(symbol: string): boolean{
	const asset = assets.find((asset) => asset.symbol === symbol);
    if(asset) {
        return true;
    } else {
        return false;
    }
}

export function isValidAssetId(assetId: string): boolean{
	const asset = assets.find((asset) => asset.id === assetId);
    if(asset) {
        return true;
    } else {
        return false;
    }
}