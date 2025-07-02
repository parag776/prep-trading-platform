import { Asset } from "@/generated/prisma";
import { getAssetsFromDB } from "../database";

let assets: Asset[];
let symbolToAssetId: Map<Asset["symbol"], Asset["id"]>;

export async function initializeAssets() {
    assets = await getAssetsFromDB()
    symbolToAssetId = new Map(assets.map((asset) => [asset.symbol, asset.id]));
}

