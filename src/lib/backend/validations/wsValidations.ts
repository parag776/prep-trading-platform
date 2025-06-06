import { z } from "zod";
import { assets} from "../store";
import { Asset, User } from "@/generated/prisma";
import { getPlaceOrderValidation, getCancelOrderValidation } from "./orderValidation";

export function getSubscribeMessageValidation(userId: Asset["id"] | null) {
	return z
		.object({
			type: z.enum(["subscribe", "unsubscribe"]),
			channel: z.enum(["orderbook", "tradebook", "openOrders", "positions"]),
			assetId: z.string().refine(
				(assetId) => {
					if(assetId==="all") return true;
					return assets.some((asset) => asset.id === assetId);
				},
				{
					message: "assetId is not valid.",
				}
			),
		})
		.superRefine((obj, ctx) => {
			if (["orderbook", "tradebook"].includes(obj.channel) && obj.assetId==="all") {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Can't subscribe to all assets",
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

export function getWsMessageValidation(userId: User["id"] | null) {
	if (!userId) {
		return getSubscribeMessageValidation(userId);
	}
	return z.union([getSubscribeMessageValidation(userId), getOrderMessageValidation(userId)]);
}
