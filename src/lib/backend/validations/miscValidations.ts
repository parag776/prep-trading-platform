import { z } from "zod";
import { assets, symbolToAssetId } from "../store";
export const depositValidation = z.object({
	amount: z.coerce.number().min(0),
});

export const orderbookValidation = z
	.object({
		symbol: z.string().refine((symbol) => assets.some((asset) => asset.symbol === symbol), {
			message: "symbol is not valid.",
		}),
	})
	.transform((data) => {
		const assetId = symbolToAssetId.get(data.symbol)!;
		const { symbol, ...rest } = data;
		return { ...rest, assetId };
	});
