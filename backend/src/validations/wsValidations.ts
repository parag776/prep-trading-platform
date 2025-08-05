import { z } from "zod";
import { Asset, User } from "../generated/prisma/client.js";	
import { getPlaceOrderValidation, getCancelOrderValidation } from "./orderValidation.js";
import { isValidAssetId } from "../store/assetStore.js";

export function getSubscribeMessageValidation(userId: User["id"] | null) {
	return z
		.object({
			type: z.enum(["subscribe", "unsubscribe"]),
			channel: z.enum(["orderbook", "tradebook", "openOrders", "positions", "accountMetrics", "fundingRate"]),
			assetId: z
				.string()
				.optional()
				.refine(
					(assetId) => {
						if(!assetId) return true;
						return isValidAssetId(assetId);
					},
					{
						message: "assetId is not valid.",
					}
				),
		})
		.superRefine((obj, ctx) => {	
			if (["orderbook", "tradebook", "fundingRate"].includes(obj.channel) && !obj.assetId) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Please provide an asset to subscribe.",
					path: ["assetId"],
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