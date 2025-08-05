import { z } from "zod";
import { getAssetFromSymbol, isValidSymbol } from "../store/assetStore.js";
export const depositValidation = z.object({
	amount: z.coerce.number(),
});

export const symbolValidation = z
	.object({
		symbol: z.string().refine((symbol) => isValidSymbol(symbol), {
			message: "symbol is not valid.",
		}),
	})
	.transform((data) => {
		const asset = getAssetFromSymbol(data.symbol);
		const { symbol, ...rest } = data;
		return { ...rest, asset };
	});
