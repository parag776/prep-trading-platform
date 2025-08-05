import { Order_Type, Side, User } from "../generated/prisma/client.js";		
import { z } from "zod";
import config from "../../../shared/config.mjs";
import { isValidAssetId } from "../store/assetStore.js";
import { getUser, getUserPositions } from "../store/userStore.js";
import { getMarkPrice } from "../store/priceStore.js";

export function getPlaceOrderValidation(userId: User["id"]) {
	const user = getUser(userId);
	const userPositions = getUserPositions(user);
	return z
		.object({
			type: z.string().refine((val) => Object.keys(Order_Type).includes(val), {
				message: "invalid type",
			}),
			side: z.string().refine((val) => Object.keys(Side).includes(val), { message: "invalid side" }),
			assetId: z.string().refine((assetId) => isValidAssetId(assetId), {
				message: "asset does not exist.",
			}),
			price: z.coerce.number().optional(),
			quantity: z.coerce.number(),
			leverage: z.coerce.number().int().min(config.leverage_min).max(config.leverage_max),
		})
		.transform((data) => {
			const typeEnum = data.type as Order_Type;
			const sideEnum = data.side as Side;
			const { type, side, ...rest } = data;
			return { ...rest, type: typeEnum, side: sideEnum };
		})
		.superRefine((obj, ctx) => {
			const openOrders = user.orders;
			const orderLeverage = Array.from(openOrders.values()).find((order)=>order.assetId===obj.assetId)?.leverage;
			const actualLeverage = userPositions.get(obj.assetId)?.leverage;
			if ((actualLeverage && actualLeverage !== obj.leverage) || (orderLeverage && (orderLeverage!==obj.leverage))) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Leverage mismatch: All positions and open orders for the same asset must use the same leverage setting.",
					path: ["leverage"], 
				});
			}
			const markPrice = getMarkPrice(obj.assetId);
			if (!obj.price) {
				if (obj.type === Order_Type.LIMIT) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "with limit order, price is compulsory",
						path: ["price"],
					});
					return;
				}
				if (obj.quantity * markPrice < 0.1) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "Expected order value should be atleast 0.1 USDC",
						path: ["price"],
					});
					return;
				}
				return;
			} else {
				if (obj.quantity <= 0) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "Order quantity should be greater than 0.",
						path: ["price"],
					});
					return;
				}
				if (obj.quantity * obj.price < 0.1) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "Order value should be atleast 0.1 USDC",
						path: ["price"],
					});
					return;
				}
			}
			const minPrice = markPrice * config.min_order_ratio;
			const maxPrice = markPrice * config.max_order_ratio;
			if (obj.price < minPrice) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Order price is way below mark price.",
					path: ["price"],
				});
			} else if (obj.price > maxPrice) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Order price is way above mark price.",
					path: ["price"],
				});
			}
		});
}

export function getCancelOrderValidation(userId: User["id"]) {
	const user = getUser(userId);

	return z.object({
		id: z.string().refine((id) => user.orders.has(id), {
			message: "invalid order id.",
		}),
	});
}
