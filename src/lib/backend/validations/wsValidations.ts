import { z } from "zod";
import { assets, symbolToAssetId } from "../store";
import { Asset, User } from "@/generated/prisma";
import { getPlaceOrderValidation, getCancelOrderValidation } from "./orderValidation";

export function getSubscribeMessageValidation(userId: Asset["id"] | null) {
	return z
		.object({
			type: z.literal("subscribe"),
			channel: z.enum([
				"orderbook",
				"tradebook",
				"openOrders",
				"positions",
			]),
			symbol: z
				.string()
				.refine((symbol) => assets.some((asset) => asset.symbol === symbol), {
					message: "symbol is not valid.",
				})
				.optional(),
		})
		.transform((obj) => {
			const assetId = obj.symbol === undefined ? undefined : symbolToAssetId.get(obj.symbol);
			const { symbol, ...rest } = obj;
			return { ...rest, assetId };
		})
		.superRefine((obj, ctx) => {
			if (["orderbook", "tradebook"].includes(obj.channel) && !obj.assetId) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Symbol is not provided.",
					path: ["symbol"],
				});
			}
			if (["openOrders", "positions"].includes(obj.channel) && !userId) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Authentication needed.",
					path: ["channel"],
				});
			}
		});
}

export function getOrderMessageValidation(userId: User["id"]) {

	return z
		.object({
			type: z.literal("order"),
		})
		.and(
			z.discriminatedUnion("action", [
				z.object({
					action: z.literal("place"),
					payload: getPlaceOrderValidation(userId),
				}),
				z.object({
					action: z.literal("cancel"),
					payload: getCancelOrderValidation(userId),
				}),
			])
		);
}

export function getWsMessageValidation(userId: User["id"] | null) {
	if (!userId) {
		return getSubscribeMessageValidation(userId);
	}
	return z.union([getSubscribeMessageValidation(userId), getOrderMessageValidation(userId)]);
}
