import { Order, Order_Status, Order_Type, Prisma, PrismaPromise, Side, User } from "@/generated/prisma";
import prisma, { appendUserBalanceInDB } from "./database";
import { matchingEngine } from "./matchingEngine";
import { respondToSubscribers, updatePositionResponsesContractPrice } from "./webSockets/utils";
import { detailedUsersState } from "./store";
import { getContractPrice } from "./utils";
import Queue from "yocto-queue";
import { UserWithPositionsAndOpenOrders } from "./types";
import {v4 as uuid} from "uuid";
import { placeOrder } from "../common/types";

function liquidateUser(user: UserWithPositionsAndOpenOrders, orderQueue: Queue<Order>) {

	user.usdc -= user.InitialMargin;
	// reducing balance with margin
	databaseActions.push(() => appendUserBalanceInDB(user.id, -user.InitialMargin));
	user.InitialMargin = 0;
	user.maintenanceMargin = 0;
	user.funding_unpaid = 0;
	user.pnl = 0;

	for(const [assetId, position] of user.positions){
		

		// making order for closing the position.
		const order: Order = {
			id: uuid(),
			type: Order_Type.MARKET,
			status: Order_Status.OPEN,
			side: position.side===Side.ASK ? Side.BID : Side.ASK,
			price: null,
			quantity: position.quantity,
			filled_quantity: 0,
			average_filled_price: 0,
			assetId: assetId, 
			userId: position.userId,
			leverage: position.leverage,
			createdAt: new Date(Date.now()),
			updatedAt: new Date(Date.now()),
		}

		orderQueue.enqueue(order)
	}

}

// this array will include all the functions that will run and
export let databaseActions: Array<() => PrismaPromise<any>>;

export async function orderManager(clientOrder: placeOrder, userId: User["id"]) {
	// assign database actions an empty array
	databaseActions = [];

	const order = {...clientOrder, createdAt: new Date(Date.now()), updatedAt: new Date(Date.now()), status: Order_Status.OPEN, filled_quantity: 0, average_filled_price: 0, id: uuid(), userId, price: clientOrder.price ?? null}
	// place order
	// matchingEngine(order);

	const orderQueue = new Queue<Order>();
	orderQueue.enqueue(order);
	let isLiquidation = false;

	while (orderQueue.size) {
		// process the order..
		const order = orderQueue.dequeue()!;

		// initial liquidation is false.
		matchingEngine(order, isLiquidation);

		
		isLiquidation = true;

		const contractPrice = getContractPrice(order.assetId);

		for (const [userId, user] of detailedUsersState) {
			const position = user.positions.get(order.assetId);
			if(!position) continue;

			// adjust pnl
			user.pnl -= position.pnl; // first remove the previous pnl of the asset of user

			let singleQuantityProfit = contractPrice - position.average_price;
			if (position.side === Side.ASK) singleQuantityProfit = -singleQuantityProfit;
			const positionPNL = singleQuantityProfit * position.quantity;

			position.pnl = positionPNL;
			user.pnl += positionPNL;


			// now check if user is liquidated or not, clearly user's pnl only be affected he has the position.
			const nonCashEquity = user.InitialMargin + user.pnl - user.funding_unpaid;
			if(nonCashEquity>=user.maintenanceMargin) continue; // no liquidation
			// will liquidate here

			liquidateUser(user, orderQueue);

		}
	}
	// add to database. this step solidifies the order and changes the overall state of exchange.
	await prisma.$transaction(databaseActions.map((fn) => fn()));

	// this steps adds the current contract price to the position..!
	updatePositionResponsesContractPrice();

	// this step is to propogate to the clients who have subscribed.
	respondToSubscribers();

	// this step is to respond to the user who made the order.
	// this step is not necessary..
}
