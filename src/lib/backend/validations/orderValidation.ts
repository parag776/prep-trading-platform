import { Order_Type, Side, User } from "@/generated/prisma";
import { z } from "zod";
import { assets, detailedUsersState, spotPrices } from "../store";
import config from "../../../../config.json";

export function getPlaceOrderValidation(userId: User["id"]) {
	const userPositions = detailedUsersState.get(userId)?.positions!;

	return z
		.object({
			type: z.string().refine((val) => Object.keys(Order_Type).includes(val), {
				message: "invalid type",
			}),
			side: z
				.string()
				.refine((val) => Object.keys(Side).includes(val), { message: "invalid side" }),
			assetId: z.string().refine((assetId) => assets.some((asset) => asset.id === assetId), {
				message: "asset does not exist.",
			}),
			price: z.coerce.number().optional(),
			quantity: z.coerce.number(),
			leverage: z.coerce.number().int().min(config.leverage_min).max(config.leverage_max),
		})
		.transform((data) => {
			const typeEnum = data.type as Order_Type
			const sideEnum = data.type as Side
			const {  type, side, ...rest } = data;
			return { ...rest, type: typeEnum, side: sideEnum };
		})
		.superRefine((obj, ctx) => {
			const actualLeverage = userPositions.get(obj.assetId)?.leverage;
			if (actualLeverage !== obj.leverage) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message:
						"Leverage mismatch: All positions for the same asset must use the same leverage setting.",
					path: ["leverage"],
				});
			}

			if (!obj.price) {
				if (obj.type === Order_Type.LIMIT) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "with limit order, price is compulsory",
						path: ["price"],
					});
				}
				return;
			}
			const spotPrice = spotPrices.get(obj.assetId)!;
			const minPrice = spotPrice * config.min_order_ratio;
			const maxPrice = spotPrice * config.max_order_ratio;
			if (obj.price < minPrice) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Order price is way below spot price.",
					path: ["price"],
				});
			} else if (obj.price > maxPrice) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Order price is way above spot price.",
					path: ["price"],
				});
			}
		});
}

export function getCancelOrderValidation(userId: User["id"]) {
	const user = detailedUsersState.get(userId)!;

	return z.object({
		id: z.string().refine((id) => user.orders.has(id), {
			message: "invalid order id.",
		}),
	});
}
