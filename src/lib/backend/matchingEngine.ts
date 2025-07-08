import { Asset, Order, Order_Status, Position, Side, Trade, User } from "@/generated/prisma";
import { calculateMarginAndCheckLiquidity } from "./marginRequirement";
import { AppError, ErrorType } from "../common/error";
import config from "../../../config.json";
import { calculateFee, calculateMaintenanceMargin, calculateMarginWithFee, calculateMarginWithoutFee, calculateUserPnl } from "./utils";
import { OrderBook } from "./types";
import { addOrderToDB, addPositionToDB, addTradeToDB, appendUserBalanceInDB, deletePositionFromDB, updateLatestCandleToDB, updateOrderInDB, updatePositionInDB } from "./database";
import { v4 as uuid } from "uuid";
import { resolutionInfo } from "../common/data";
import { databaseActions } from "./exchangeController";
import { addAccountMetricResponse, addOrderDiffResponse, addOrderbookDiffResponse, addPositionResponse, addTradeResponse } from "./webSockets/utils";
import { OrderWithRequiredPrice } from "../common/types";
import {
	addOrderToUser,
	adjustInitialMargin,
	adjustMaintainanceMargin,
	adjustOrderMargin,
	removePositionFromUser,
	getOrderOfUser,
	getPositionOfUser,
	getUser,
	removeOrderFromUser,
	addPositionToUser,
	adjustUsdc,
} from "./store/userStore";
import { addOrderToOrderbook, getOrderbook, printOrderbook, removeOrderFromOrderbook } from "./store/orderbookStore";
import { adjustCandle, getLatestCandle } from "./store/candleStore";

// createOrder(order, orderbook, orderPrice, remainingQuantity, average_filled_price)

function createOrder(order: OrderWithRequiredPrice, average_filled_price: number, filled_quantity: number, orderbook: OrderBook) {
	const remaining_quantity = order.quantity - order.filled_quantity;
	if (order.price && remaining_quantity) {
		// updated userMargin
		const margin = calculateMarginWithFee(order.price, remaining_quantity, order.leverage, config.maker_fee);

		const user = getUser(order.userId);

		adjustOrderMargin(user, margin);
		addAccountMetricResponse(user);

		//order
		order.filled_quantity = filled_quantity;
		order.average_filled_price = average_filled_price;

		// updated user orders
		addOrderToUser(user, order);

		// added order to orderbook
		if (order.side === Side.ASK) {
			orderbook.askOrderbook.orders = orderbook.askOrderbook.orders.insert(order, null);
		} else {
			orderbook.bidOrderbook.orders = orderbook.bidOrderbook.orders.insert(order, null);
		}

		addOrderbookDiffResponse(order.assetId, order.side, order.price, remaining_quantity);
	} else {
		order.filled_quantity = filled_quantity;
		order.average_filled_price = average_filled_price;
		order.status = Order_Status.FILLED;
	}
	databaseActions.push(() => addOrderToDB(order));
	addOrderDiffResponse(order);
}

// please remember this order object has come from the user and not from the main order object.
function decreaseOrder(userId: User["id"], orderId: Order["id"], fill: number) {
	const user = getUser(userId);
	const order = getOrderOfUser(user, orderId);
	const margin = calculateMarginWithFee(order.price, fill, order.leverage, config.maker_fee);
	// reducing order margin
	adjustOrderMargin(user, -margin);

	// removing order from orderbook and user.
	removeOrderFromOrderbook(order);
	removeOrderFromUser(user, orderId);

	const total_filled_quantity = order.filled_quantity + fill;
	const average_filled_price = (order.filled_quantity * order.average_filled_price + fill * order.price) / total_filled_quantity;

	order.filled_quantity = total_filled_quantity;
	order.average_filled_price = average_filled_price;

	if (total_filled_quantity !== order.quantity) {
		// adding back order in orderbook and user.
		addOrderToOrderbook(order);
		addOrderToUser(user, order);
	} else {
		// other wise order is filled.
		order.status = Order_Status.FILLED;
	}

	// giving responses and update in db.

	// (-) because we are reducing quantity.
	addOrderbookDiffResponse(order.assetId, order.side, order.price, -fill);
	addAccountMetricResponse(getUser(userId));
	addOrderDiffResponse(order);
	databaseActions.push(() => updateOrderInDB(order));
}

export function cancelOrder(userId: User["id"], orderId: Order["id"]) {
	const user = getUser(userId);
	const order = getOrderOfUser(user, orderId);
	const remaining_quantity = order.quantity - order.filled_quantity;
	const margin = calculateMarginWithFee(order.price, remaining_quantity, order.leverage, config.maker_fee);
	// reducing order margin
	adjustOrderMargin(user, -margin);

	// removing order from orderbook and user.
	removeOrderFromOrderbook(order);
	removeOrderFromUser(user, orderId);

	// other wise order is filled.
	order.status = Order_Status.CANCELLED;

	// giving responses and update in db.

	// (-) because we are reducing quantity.
	addOrderbookDiffResponse(order.assetId, order.side, order.price, -remaining_quantity);
	addAccountMetricResponse(getUser(userId));
	addOrderDiffResponse(order);
	databaseActions.push(() => updateOrderInDB(order));
}

function makeTrade(price: number, quantity: number, assetId: string, buyerId: User["id"], sellerId: User["id"], isLastTrade: Boolean) {
	const trade: Trade = {
		id: uuid(),
		buyerId: buyerId,
		sellerId: sellerId,
		price,
		quantity,
		assetId,
		createdAt: new Date(Date.now()),
	};

	// if its last trade of the order, process the candle and update historical data.
	if (isLastTrade) {
		for (let resolution of resolutionInfo.keys()) {
			adjustCandle(assetId, resolution, trade);
			const candle = getLatestCandle(assetId, resolution);
			databaseActions.push(() => updateLatestCandleToDB(assetId, resolution, candle));
		}
	}

	databaseActions.push(() => addTradeToDB(trade));

	addTradeResponse(trade);
}

function closeLiquidatedPosition(userId: User["id"], assetId: Asset["id"]) {
	const user = getUser(userId);
	const position = getPositionOfUser(user, assetId);

	position.quantity = 0;
	position.average_price = 0;
	position.updatedAt = new Date(Date.now());

	// deleting the state.
	removePositionFromUser(user, assetId);

	// now since the position is 0 remove the position from position Array;
	databaseActions.push(() => deletePositionFromDB(position));
	addPositionResponse(position);
}

function makePosition(userId: User["id"], assetId: Asset["id"], side: Side, quantity: number, price: number, leverage: number, is_maker: boolean) {
	const user = getUser(userId);
	const position = getPositionOfUser(user, assetId);
	// taking fee
	const fee = calculateFee(price, quantity, leverage, is_maker ? config.maker_fee : config.taker_fee);
	adjustUsdc(user, fee);
	addAccountMetricResponse(user);
	databaseActions.push(() => appendUserBalanceInDB(user.id, -fee));

	// case where position did not exist already.
	if (!position) {
		adjustMaintainanceMargin(user, calculateMaintenanceMargin(price, quantity));
		adjustInitialMargin(user, calculateMarginWithoutFee(quantity, price, leverage));
		addAccountMetricResponse(user);

		const newPosition: Position = {
			id: uuid(),
			side,
			assetId,
			userId: user.id,
			average_price: price,
			quantity,
			leverage,
			createdAt: new Date(Date.now()),
			updatedAt: new Date(Date.now()),
		};
		addPositionToUser(user, newPosition);
		databaseActions.push(() => addPositionToDB(newPosition));
		addPositionResponse(newPosition);
		return;
	}

	// cases where position exisisted --->

	// first things first making all pnl = 0 <-----> because i will forget it and it will be the biggest reason for a bug.

	// case where we are just adding to the position.
	if (position.side === side) {
		adjustMaintainanceMargin(user, calculateMaintenanceMargin(price, quantity));
		adjustInitialMargin(user, calculateMarginWithoutFee(quantity, price, leverage));

		const new_quantity = position.quantity + quantity;
		const new_average_price = (position.average_price * position.quantity + price * quantity) / new_quantity;

		position.quantity = new_quantity;
		position.average_price = new_average_price;
		position.updatedAt = new Date(Date.now());

		databaseActions.push(() => updatePositionInDB(position));
		addPositionResponse(position);
		addAccountMetricResponse(user);
		return;
	}

	// remaining cases are only those where position is being made to the opposite direction.
	if (position.quantity > quantity) {
		// reducing earlier margin that was already added.
		adjustMaintainanceMargin(user, -calculateMaintenanceMargin(position.average_price, quantity));
		adjustInitialMargin(user, -calculateMarginWithoutFee(quantity, position.average_price, leverage));

		// adding profit
		const profit = quantity * (price - position.average_price);
		adjustUsdc(user, profit);
		databaseActions.push(() => appendUserBalanceInDB(user.id, profit));

		// price will be same
		position.quantity -= quantity;
		position.updatedAt = new Date(Date.now());

		databaseActions.push(() => updatePositionInDB(position));
		addPositionResponse(position);
		addAccountMetricResponse(user);
	} else if (position.quantity === quantity) {
		// reducing earlier margin that was already added.
		adjustMaintainanceMargin(user, -calculateMaintenanceMargin(position.average_price, quantity));
		adjustInitialMargin(user, -calculateMarginWithoutFee(quantity, position.average_price, leverage));

		// adding profit
		const profit = quantity * (price - position.average_price);
		adjustUsdc(user, profit);
		databaseActions.push(() => appendUserBalanceInDB(user.id, profit));

		position.quantity = 0;
		position.average_price = 0;
		position.updatedAt = new Date(Date.now());

		// now since the position is 0 remove the position from position Array;
		databaseActions.push(() => deletePositionFromDB(position));
		addPositionResponse(position);
		addAccountMetricResponse(user);

		// deleting the state.
		removePositionFromUser(user, assetId);
	} else {
		const oppositeQuantity = quantity - position.quantity;

		// first removing initial margin
		adjustMaintainanceMargin(user, -calculateMaintenanceMargin(position.average_price, quantity));
		adjustInitialMargin(user, -calculateMarginWithoutFee(quantity, position.average_price, leverage));

		// then adding the margin created by opposite position.
		
		adjustMaintainanceMargin(user, calculateMaintenanceMargin(price, oppositeQuantity));
		adjustInitialMargin(user, calculateMarginWithoutFee(oppositeQuantity, price, leverage));

		// adding profit for the position that is closed,
		const profit = quantity * (price - position.average_price);
		adjustUsdc(user, profit);
		databaseActions.push(() => appendUserBalanceInDB(user.id, profit));

		position.quantity = oppositeQuantity;
		position.average_price = price;
		position.updatedAt = new Date(Date.now());
		position.side = side; // in this case the side also changed.

		databaseActions.push(() => updatePositionInDB(position));
		addPositionResponse(position);
		addAccountMetricResponse(user);
	}
}

export function matchingEngine(order: Order, isLiquidation: Boolean = false) {
	const user = getUser(order.userId);
	// this is checking if enough liquidity is present to process the order..else throw an error.
	const marginRequired = calculateMarginAndCheckLiquidity(order);

	if (!isLiquidation) {
		const accountEquity = user.usdc - user.funding_unpaid + calculateUserPnl(user);
		const availableMargin = accountEquity - user.initialMargin - user.orderMargin;
		if (availableMargin < marginRequired) {
			throw new AppError(ErrorType.InsufficientMarginError, `${user.name} with user id ${user.id} doesn't have enough margin for the trade.`, 422);
		}
	}

	let orderbook = getOrderbook(order.assetId);
	printOrderbook(orderbook);

	// orderbook.askOrderbook.orders.

	if (order.side === Side.ASK) {
		let remainingQuantity = order.quantity;
		let currentPositionSize = 0;
		let filledQuantity = 0;
		// if its a market order, price is 0.
		const orderPrice = order.price || 0;

		for (let bidOrder of orderbook.bidOrderbook.orders.keys) {
			// checking condition -> asking price is greater than maximum bidding price. (maker)
			if (orderPrice > bidOrder.price) {
				break;
			}

			// checking condition -> remaining quantity is less than current bidOrder quantity (taker)
			if (remainingQuantity <= bidOrder.quantity) {
				// fillOrder(bidOrder, quantityToFill);
				filledQuantity += remainingQuantity;
				currentPositionSize += remainingQuantity * bidOrder.price;

				let average_filled_price = 0;
				if (filledQuantity > 0) {
					average_filled_price = currentPositionSize / filledQuantity;
				}

				// making position for the user whose order has been filled.
				// decreasing order that was already in place.
				decreaseOrder(bidOrder.userId, bidOrder.id, remainingQuantity);

				// making position for the one whose order was matched.
				makePosition(bidOrder.userId, bidOrder.assetId, bidOrder.side, remainingQuantity, bidOrder.price, bidOrder.leverage, true);

				// making position for current user who placed the order.
				if (isLiquidation) {
					closeLiquidatedPosition(user.id, order.assetId);
				} else {
					makePosition(user.id, order.assetId, order.side, filledQuantity, average_filled_price, order.leverage, false);
				}
				makeTrade(bidOrder.price, remainingQuantity, order.assetId, bidOrder.userId, order.userId, true);

				remainingQuantity = 0;
				break;
			}

			// otherwise, consume this order and move ahead.

			decreaseOrder(bidOrder.userId, bidOrder.id, bidOrder.quantity);

			// making position for whose order was matched.
			makePosition(bidOrder.userId, bidOrder.assetId, bidOrder.side, bidOrder.quantity, bidOrder.price, bidOrder.leverage, true);
			makeTrade(bidOrder.price, bidOrder.quantity, order.assetId, bidOrder.userId, order.userId, false);

			filledQuantity += bidOrder.quantity;
			currentPositionSize += bidOrder.quantity * bidOrder.price;
			remainingQuantity -= bidOrder.quantity;
		}

		if (remainingQuantity) {
			let average_filled_price = 0;
			if (filledQuantity > 0) {
				average_filled_price = currentPositionSize / filledQuantity;

				// making position for the order filled.
				if (isLiquidation) {
					closeLiquidatedPosition(user.id, order.assetId);
				} else {
					makePosition(user.id, order.assetId, order.side, filledQuantity, average_filled_price, order.leverage, false);
				}
			}

			// create order and update orderbook (take care of margin, remember margin is here with fee)
			createOrder({ ...order, price: orderPrice }, orderPrice, remainingQuantity, orderbook);

			remainingQuantity = 0;
		}
	} else {
		let remainingQuantity = order.quantity;
		let currentPositionSize = 0;
		let filledQuantity = 0;
		// if its a market order, price is 0.
		const orderPrice = order.price || Math.max();

		for (let askOrder of orderbook.askOrderbook.orders.keys) {
			// checking condition -> asking price is greater than maximum bidding price. (maker)
			if (orderPrice < askOrder.price) {
				break;
			}

			// checking condition -> remaining quantity is less than current bidOrder quantity (taker)
			if (remainingQuantity <= askOrder.quantity) {
				// fillOrder(bidOrder, quantityToFill);
				filledQuantity += remainingQuantity;
				currentPositionSize += remainingQuantity * askOrder.price;

				let average_filled_price = 0;
				if (filledQuantity > 0) {
					average_filled_price = currentPositionSize / filledQuantity;
				}

				// making position for the user whose order has been filled.
				// decreasing order that was already in place.
				decreaseOrder(askOrder.userId, askOrder.id, remainingQuantity);

				// making position for the one whose order was matched.
				makePosition(askOrder.userId, askOrder.assetId, askOrder.side, remainingQuantity, askOrder.price, askOrder.leverage, true);

				// making position for current user who placed the order.
				if (isLiquidation) {
					closeLiquidatedPosition(user.id, order.assetId);
				} else {
					makePosition(user.id, order.assetId, order.side, filledQuantity, average_filled_price, order.leverage, false);
				}
				makeTrade(askOrder.price, remainingQuantity, order.assetId, order.userId, askOrder.userId, true);

				remainingQuantity = 0;
				break;
			}

			// otherwise, consume this order and move ahead.

			decreaseOrder(askOrder.userId, askOrder.id, askOrder.quantity);

			// making position for whose order was matched.
			makePosition(askOrder.userId, askOrder.assetId, askOrder.side, askOrder.quantity, askOrder.price, askOrder.leverage, true);
			makeTrade(askOrder.price, askOrder.quantity, order.assetId, order.userId, askOrder.userId, false);

			filledQuantity += askOrder.quantity;
			currentPositionSize += askOrder.quantity * askOrder.price;
			remainingQuantity -= askOrder.quantity;
		}

		if (remainingQuantity) {
			let average_filled_price = 0;
			if (filledQuantity > 0) {
				average_filled_price = currentPositionSize / filledQuantity;
				if (isLiquidation) {
					closeLiquidatedPosition(user.id, order.assetId);
				} else {
					makePosition(user.id, order.assetId, order.side, filledQuantity, average_filled_price, order.leverage, false);
				}
			}

			// create order and update orderbook (take care of margin, remember margin is here with fee)
			createOrder({ ...order, price: orderPrice }, orderPrice, remainingQuantity, orderbook);

			remainingQuantity = 0;
		}
	}
}
