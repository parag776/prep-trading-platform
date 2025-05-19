import { z } from "zod";
import { assets, symbolToAssetId } from "../store";
import { resolutionSymbols } from "@/lib/common/data";

export const historyValidation = z.object({
	symbol: z.string().refine((val) => assets.some((asset) => asset.symbol === val), {
		message: "Invalid symbol",
	}),
	resolutionString: z.string().refine((val) => resolutionSymbols.includes(val), {
		message: "Invalid resolution",
	}),
	from: z.coerce.number().int().nonnegative(),
	to: z.coerce.number().int().nonnegative(),
	countback: z.coerce.number().int().nonnegative(),
}).transform((data) => {
	const assetId = symbolToAssetId.get(data.symbol)!;
	const { symbol, ...rest } = data;
	return { ...rest, assetId };
});;
