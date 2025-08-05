import { Order, Order_Status, Order_Type, PrismaPromise, Side, User } from "./generated/prisma/client.js";
import { liquidateUserInDB, pushToDatabase } from "./database.js";
import { cancelOrder, matchingEngine } from "./matchingEngine.js";
import { addAccountMetricResponse, respondToSubscribers } from "./webSocket/utils.js";
import { UserWithPositionsAndOpenOrders } from "./types.js";
import { v4 as uuid } from "uuid";
import { PlaceOrder } from "../../shared/types.mjs";
import { getMarkPrice } from "./store/priceStore.js";
import { getAllUsers } from "./store/userStore.js";
// this array will include all the functions that will run and
export let databaseActions: Array<() => PrismaPromise<any>>;

// the exchange operation should be sync. because async could cause inconsistencies.
export async function runExchangeOperation(operation: () => void) {
	databaseActions = [];
	operation();
	await pushToDatabase(databaseActions);
	// this step is to propogate to the clients who have subscribed.
	respondToSubscribers();
}

export async function placeOrder(clientOrder: PlaceOrder, userId: User["id"]) {
	await runExchangeOperation(() => {
		const order = {
			...clientOrder,
			createdAt: new Date(Date.now()),
			updatedAt: new Date(Date.now()),
			status: Order_Status.OPEN,
			filled_quantity: 0,
			average_filled_price: 0,
			id: uuid(),
			userId,
			price: clientOrder.price ?? null,
		};


		// place order
		matchingEngine(order, false);
	});
}

export async function executeOrderCancellation(userId: User["id"], orderId: Order["id"]){
	await runExchangeOperation(()=>{
		cancelOrder(userId, orderId);
	});
}

async function liquidateUser(user: UserWithPositionsAndOpenOrders) {
	await runExchangeOperation(() => {
		// canceling orders.
		for (const [orderId] of user.orders) {
			cancelOrder(user.id, orderId);
		}

		// making order for closing the position.
		for (const [assetId, position] of user.positions) {
			const order: Order = {
				id: uuid(),
				type: Order_Type.MARKET,
				status: Order_Status.OPEN,
				side: position.side === Side.ASK ? Side.BID : Side.ASK,
				price: null,
				quantity: position.quantity,
				filled_quantity: 0,
				average_filled_price: 0,
				assetId: assetId,
				userId: position.userId,
				leverage: position.leverage,
				createdAt: new Date(Date.now()),
				updatedAt: new Date(Date.now()),
			};

			matchingEngine(order, true);
		}

		// adding this at the end because ultimately whatever happens, however user's account metric changes, his ultimate metric at the end should be this.
		user.usdc = 0;
		user.orderMargin = 0;
		user.initialMargin = 0;
		user.maintenanceMargin = 0;
		user.funding_unpaid = 0;
		addAccountMetricResponse(user);
		databaseActions.push(() => liquidateUserInDB(user.id));
	});
}

export async function checkLiquidation() {
	const users = getAllUsers();
	for (const [userId, user] of users) {
		let pnl = 0;
		for (const [positionId, position] of user.positions) {
			const markPrice = getMarkPrice(position.assetId);
			let profit = (markPrice - position.average_price) * position.quantity;
			if (position.side === Side.ASK) {
				profit = -profit;
			}
			pnl += profit;
		}
		const accountEquity = user.usdc + pnl - user.funding_unpaid;
		if (accountEquity < user.maintenanceMargin) {
			await liquidateUser(user);
		}
	}
}