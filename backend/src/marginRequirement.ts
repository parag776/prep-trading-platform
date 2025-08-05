import { Order, Order_Type, Side } from "./generated/prisma/client.js";
import { calculateMarginWithFee } from "./utils.js";	
import { AppError } from "../../shared/error.mjs";
import { getOrderbook } from "./store/orderbookStore.js";
import config from "../../shared/config.mjs";

const makerFee = config.maker_fee;
const takerFee = config.taker_fee;

export function calculateMarginAndCheckLiquidity(order: Order) {	
	const orderbook = getOrderbook(order.assetId);

	let margin = 0;

	if (order.side === Side.ASK) {
		let remainingQuantity = order.quantity;

		// if its a market order, price is 0.
		const orderPrice = order.price || 0;
		for (let bidOrder of orderbook.bidOrderbook.orders.keys) {
			// checking condition -> asking price is greater than maximum bidding price. (maker)
			if (orderPrice > bidOrder.price) {
				margin += calculateMarginWithFee(orderPrice, remainingQuantity, order.leverage, makerFee);
				remainingQuantity = 0;
				break;
			}

			// checking condition -> remaining quantity is less than current bidOrder quantity (taker)
			if (remainingQuantity <= bidOrder.quantity) {
				margin += calculateMarginWithFee(bidOrder.price, remainingQuantity, order.leverage, takerFee);
				remainingQuantity = 0;
				break;
			}

			// otherwise, consume this order and move ahead.
			margin += calculateMarginWithFee(bidOrder.price, bidOrder.quantity, order.leverage, takerFee);
			remainingQuantity -= bidOrder.quantity;
		}

		// if still quantity remaining. (maker)
		if (remainingQuantity) {
			if (order.type === Order_Type.MARKET) {
				throw new AppError("There is not enough liquidity in market.", 422);
			}

			margin += calculateMarginWithFee(orderPrice, remainingQuantity, order.leverage, makerFee);
		}
	} else {
		let remainingQuantity = order.quantity;
		const orderPrice = order.price ||  Number.MAX_SAFE_INTEGER;
		for (let askOrder of orderbook.askOrderbook.orders.keys) {
			// checking condition -> bidding price is less than minimum asking price. (maker)
			if (orderPrice < askOrder.price) {
				margin += calculateMarginWithFee(orderPrice, remainingQuantity, order.leverage, makerFee);
				remainingQuantity = 0;
				break;
			}

			// checking condition -> remaining quantity is less than current askOrder quantity (taker)
			if (remainingQuantity <= askOrder.quantity) {
				margin += calculateMarginWithFee(askOrder.price, remainingQuantity, order.leverage, takerFee);
				remainingQuantity = 0;
				break;
			}

			// otherwise, consume this order and move ahead.
			margin += calculateMarginWithFee(askOrder.price, askOrder.quantity, order.leverage, takerFee);
			remainingQuantity -= askOrder.quantity;
		}

		// if still quantity remaining. (maker)
		if (remainingQuantity) {
			if (order.type === Order_Type.MARKET) {
				throw new AppError("There is not enough liquidity in market.", 422); // todo, create new Error Class extending this one.
			}

			margin += calculateMarginWithFee(orderPrice, remainingQuantity, order.leverage, makerFee);
		}
	}

	return margin;
}
