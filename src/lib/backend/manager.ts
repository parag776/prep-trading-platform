import { Order, Order_Status, Order_Type, PrismaPromise, Side, User } from "@/generated/prisma";
import { liquidateUserInDB, pushToDatabase } from "./database";
import { cancelOrder, matchingEngine } from "./matchingEngine";
import { addAccountMetricResponse, respondToSubscribers } from "./webSockets/utils";
import { UserWithPositionsAndOpenOrders } from "./types";
import {v4 as uuid} from "uuid";
import { placeOrder } from "../common/types";



// this array will include all the functions that will run and
export let databaseActions: Array<() => PrismaPromise<any>>;

// the exchange operation should be sync. because async could cause inconsistencies.
async function runExchangeOperation(operation: ()=>void){
	databaseActions = [];
	operation();
	await pushToDatabase(databaseActions);
	// this step is to propogate to the clients who have subscribed.
	respondToSubscribers();	
}


function liquidateUser(user: UserWithPositionsAndOpenOrders) {

	runExchangeOperation(()=>{
		// canceling orders.
		for(const [orderId] of user.orders){
			cancelOrder(user.id, orderId);
		}

		// making order for closing the position.
		for(const [assetId, position] of user.positions){
			
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

			matchingEngine(order, true);
		}
		
		// adding this at the end because ultimately whatever happens, however user's account metric changes, his ultimate metric at the end should be this.
		user.usdc = 0;
		user.orderMargin = 0;
		user.InitialMargin = 0;
		user.maintenanceMargin = 0;
		user.funding_unpaid = 0;
		addAccountMetricResponse(user);
		databaseActions.push(() => liquidateUserInDB(user.id));
	})

}

export function orderManager(clientOrder: placeOrder, userId: User["id"]) {

	runExchangeOperation(()=>{

		// assign database actions an empty array
		databaseActions = [];

		const order = {...clientOrder, createdAt: new Date(Date.now()), updatedAt: new Date(Date.now()), status: Order_Status.OPEN, filled_quantity: 0, average_filled_price: 0, id: uuid(), userId, price: clientOrder.price ?? null}
		// place order
		matchingEngine(order, false);
	})

}
