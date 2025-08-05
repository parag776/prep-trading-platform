import { Asset, Order, Order_Status, Position, PrismaClient, PrismaPromise, Resolution, Trade, User } from "./generated/prisma/client.js";
import { Candle, UserWithPositionsAndOpenOrders } from "./types.js";
import { OrderWithRequiredPrice, TradeLite } from "../../shared/types.mjs";
import configData from "../../shared/config.mjs"

const prisma = new PrismaClient();
export default prisma;

export function appendUserBalanceInDB(userId: User["id"], amount: number) {
	return prisma.user.update({
		where: {
			id: userId,
		},
		data: {
			usdc: {
				increment: amount,
			},
		},
	});
}

export function updateUserAfterFunding(user: UserWithPositionsAndOpenOrders){
	return prisma.user.update({
		where: {
			id: user.id,
		},
		data: {
			usdc: user.usdc,
			funding_unpaid: user.funding_unpaid
		}
	})
}

export function liquidateUserInDB(userId: User["id"]) {
	return prisma.user.update({
		where: {
			id: userId,
		},
		data: {
			usdc: 0,
			funding_unpaid: 0,
		},
	});
}

export function addPositionToDB(position: Position) {
	return prisma.position.create({
		data: position,
	});
}

export function deletePositionFromDB(position: Position) {
	return prisma.position.delete({
		where: {
			id: position.id,
		},
	});
}

export function updatePositionInDB(position: Position) {
	return prisma.position.update({
		where: {
			id: position.id,
		},
		data: {
			side: position.side,
			average_price: position.average_price,
			quantity: position.quantity,
			updatedAt: position.updatedAt,
		},
	});
}

export function addOrderToDB(order: Order) {
	return prisma.order.create({
		data: order,
	});
}

export function updateOrderInDB(order: Order) {
	return prisma.order.update({
		where: {
			id: order.id,
		},
		data: order,
	});
}

export function addTradeToDB(trade: Trade) {
	return prisma.trade.create({
		data: trade,
	});
}

export async function getOpenOrdersByAssetFromDB(asset: Asset) {
	return (await prisma.order.findMany({
		where: {
			status: {
				in: ["OPEN"],
			},
			asset,
		},
	})) as OrderWithRequiredPrice[];
}

export async function getAllOpenOrdersFromDB() {
	return await prisma.order.findMany({
		where: {
			status: Order_Status.OPEN,
		},
	});
}

export async function getLatestCandleFromDB(assetId: Asset["id"], resolution: Resolution) {
	return (await prisma.historical_Data.findFirst({
		select: {
			timestamp: true,
			open: true,
			high: true,
			low: true,
			close: true,
			volume: true,
		},
		where: {
			assetId,
			resolution,
		},
		orderBy: {
			timestamp: "desc",
		},
	})) as Candle;
}

export function updateLatestCandleToDB(assetId: Asset["id"], resolution: Resolution, candle: Candle) {
	return prisma.historical_Data.upsert({
		where: {
			assetId_resolution_timestamp: {
				assetId,
				resolution,
				timestamp: candle.timestamp,
			},
		},
		update: {
			open: candle.open,
			high: candle.high,
			low: candle.low,
			close: candle.close,
			volume: candle.volume,
		},
		create: {
			assetId,
			resolution,
			timestamp: candle.timestamp,
			open: candle.open,
			high: candle.high,
			low: candle.low,
			close: candle.close,
			volume: candle.volume,
		},
	});
}

export function getUsersWithPositionsFromDB() {
	return prisma.user.findMany({
		omit: {
			password: true,
		},
		include: {
			positions: true,
		},
	});
}

export function getUserFromUsernameFromDB(username: string) {
	return prisma.user.findUnique({
		where: {
			username,
		},
	});
}

export function createLocalUserToDB(username: User["username"], name: User["name"], hashedPassword: string) {
	return prisma.user.create({
		data: {
			username,
			name,
			password: hashedPassword,
		},
	});
}

export function createOauthUserToDB(id: User["id"], name: User["name"], img_url: User["img_url"]) {
	return prisma.user.create({
		data: {
			id,
			name,
			img_url,
		},
	});
}

export function getAssetsFromDB() {
	return prisma.asset.findMany();
}

export async function pushToDatabase(databaseActions: Array<() => PrismaPromise<any>>) {
	await prisma.$transaction(databaseActions.map((fn) => fn()));
}

export async function depositInDB(userId: User["id"], amount: number) {
	await prisma.user.update({
		where: {
			id: userId,
		},
		data: {
			total_deposit: {
				increment: amount,
			},
			usdc: {
				increment: amount,
			},
		},
	});
}

export function addUserToDB(id: User["id"], name: User["name"], img_url: User["img_url"]) {
	return prisma.user.create({
		data: {
			id,
			name,
			img_url,
		},
	});
}
export async function userExistsInDB(userId: User["id"]): Promise<boolean> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true },
	});
	return !!user;
}

export async function getHistoricalDataFromDB(assetId: Asset["id"], to: number, resolution: Resolution, countback: number) {
	to *= 1000; // for converting into milliseconds
	const data = await prisma.historical_Data.findMany({
		select: {
			timestamp: true,
			open: true,
			high: true,
			low: true,
			close: true,
			volume: true,
		},
		where: {
			assetId,
			resolution,
			timestamp: {
				lte: new Date(to),
			},
		},
		orderBy: {
			timestamp: "desc",
		},
		take: countback,
	});

	return data.reverse();
}

export function getOrderHistoryFromDB(userId: User["id"]) {
	return prisma.order.findMany({
		select: {
			id: true,
			type: true,
			status: true,
			side: true,
			average_filled_price: true,
			quantity: true,
			filled_quantity: true,
			assetId: true,
			leverage: true,
			createdAt: true,
		},
		where: {
			status: {
				in: ["CANCELLED", "FILLED"],
			},
			userId,
		},
		orderBy: {
			createdAt: 'desc'
		},
		take: configData.order_history_size,
	});
}

export function getTradeHistoryFromDB(assetId: Asset["id"], limit: number): PrismaPromise<Array<TradeLite>> {
	return prisma.trade.findMany({
		select: {
			id: true,
			price: true,
			quantity: true,
			createdAt: true,
		},
		where: {
			assetId,
		},
		orderBy: {
			createdAt: "desc",
		},
		take: limit,
	});
}
