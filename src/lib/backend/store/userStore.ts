import { Asset, Order, Position, User } from "@/generated/prisma";
import { getAllOpenOrdersFromDB, getUsersWithPositionsFromDB } from "../database";
import { UserWithPositionsAndOpenOrders } from "../types";
import { OrderWithRequiredPrice } from "@/lib/common/types";
import { calculateMaintenanceMargin, calculateMarginWithFee, calculateMarginWithoutFee } from "../utils";
import configData from "../../../../config.json";
import { getOrderbooks } from "./orderbookStore";

let detailedUsersState: Map<User["id"], UserWithPositionsAndOpenOrders>;

// here non cash equity = IM of positions, due funding, pnl of positions
// export type UserWithPositionsAndOpenOrders = User & {
//   NonCashEquity: number;
//   maintenanceMargin: number;
//   orderMargin: number;
// } & (Position & { pnl: number })[] &
//   OrderWithRequiredPrice[];

export async function getDetailedUsersState() {
	const usersWithPositions = await getUsersWithPositionsFromDB();
	detailedUsersState = new Map<User["id"], UserWithPositionsAndOpenOrders>();
	// make positions
	for (let user of usersWithPositions) {
		const detailedUserState: UserWithPositionsAndOpenOrders = {
			...user,
			maintenanceMargin: 0,
			initialMargin: 0,
			orderMargin: 0,
			positions: new Map<Asset["id"], Position>(),
			orders: new Map<OrderWithRequiredPrice["id"], OrderWithRequiredPrice>(),
		};
		for (let position of user.positions) {
			detailedUserState.initialMargin += calculateMarginWithoutFee(position.average_price, position.quantity, position.leverage); // initial margin
			detailedUserState.maintenanceMargin += calculateMaintenanceMargin(position.average_price, position.quantity);
			detailedUserState.positions.set(position.assetId, position);
		}
		detailedUsersState.set(user.id, detailedUserState);
	}

	const orders = getAllOpenOrdersFromDB();

	const addOrder = (order: OrderWithRequiredPrice) => {
		const extendedUser = detailedUsersState.get(order.userId)!;
		const remainingQuantity = order.quantity - order.filled_quantity;

		// since its order margin you should block fees also, bro you almost forgot it and could have included
		// potentially a hazardous bug in your system.
		// this bug would have been so dangerous that, you could never have figured it out.
		extendedUser.orderMargin += calculateMarginWithFee(remainingQuantity, order.price, order.leverage, configData.maker_fee);
		extendedUser.orders.set(order.id, order);
	};

	const orderbooks = getOrderbooks();
	for (const [assetId, orderbook] of orderbooks) {
		for (const order of orderbook.askOrderbook.orders.keys) {
			addOrder(order);
		}
		for (const order of orderbook.bidOrderbook.orders.keys) {
			addOrder(order);
		}
	}
}

export function getUser(userId: User["id"]): Readonly<UserWithPositionsAndOpenOrders> {
	const user = detailedUsersState.get(userId);
	if (!user) {
		throw new Error(`user with userId -> ${userId} not found.`);
	} else {
		return user;
	}
}

export function getAllUsers() {
	return detailedUsersState;
}

function getMutableUser(userId: User["id"]): UserWithPositionsAndOpenOrders {
	const user = detailedUsersState.get(userId);
	if (!user) {
		throw new Error(`user with userId -> ${userId} not found.`);
	} else {
		return user;
	}
}

export function adjustOrderMargin(user: UserWithPositionsAndOpenOrders, delta: number) {
	user.orderMargin += delta;
}

export function adjustUsdc(user: UserWithPositionsAndOpenOrders, amount: number) {
	user.usdc -= amount;
}

export function deposit(user: UserWithPositionsAndOpenOrders, amount: number){
	user.total_deposit+=amount;
	user.usdc+=amount;
}

export function addOrderToUser(user: UserWithPositionsAndOpenOrders, order: OrderWithRequiredPrice) {
	user.orders.set(order.id, order);
}

export function removeOrderFromUser(user: UserWithPositionsAndOpenOrders, orderId: Order["id"]) {
	user.orders.delete(orderId);
}

export function getOrderOfUser(user: UserWithPositionsAndOpenOrders, orderId: Order["id"]) {
	const order = user.orders.get(orderId);
	if (!order) {
		throw new Error(`order with orderId -> ${orderId} not found.`);
	}
	return order;
}

export function getPositionOfUser(user: UserWithPositionsAndOpenOrders, assetId: Asset["id"]) {
	const position = user.positions.get(assetId);
	if (!position) {
		throw new Error(`position with assetId -> ${assetId} not found.`);
	}
	return position;
}

export function addPositionToUser(user: UserWithPositionsAndOpenOrders, position: Position){
	user.positions.set(position.assetId, position);
}

export function removePositionFromUser(user: UserWithPositionsAndOpenOrders, assetId: Asset["id"]) {
	user.positions.delete(assetId);
}

export function adjustMaintainanceMargin(user: UserWithPositionsAndOpenOrders, delta: number) {
	user.maintenanceMargin += delta;
}

export function adjustInitialMargin(user: UserWithPositionsAndOpenOrders, delta: number) {
	user.initialMargin += delta;
}

export function getUserPositions(user: UserWithPositionsAndOpenOrders){
	return user.positions;
}
