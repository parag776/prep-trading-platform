import { z } from "zod";
import { resolutionSymbols } from "@/lib/common/data";
import { getAssetFromSymbol, isValidSymbol } from "../store/assetStore";

export const historyValidation = z.object({
	symbol: z.string().refine((symbol) => isValidSymbol(symbol), {
		message: "Invalid symbol",
	}),
	resolutionString: z.string().refine((val) => resolutionSymbols.includes(val), {
		message: "Invalid resolution",
	}),
	from: z.coerce.number().int().nonnegative(),
	to: z.coerce.number().int().nonnegative(),
	countback: z.coerce.number().int().nonnegative(),
}).transform((data) => {
	const assetId = getAssetFromSymbol(data.symbol).id;
	const { symbol, ...rest } = data;
	return { ...rest, assetId };
});;
