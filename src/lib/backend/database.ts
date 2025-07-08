import { Asset, Order, Order_Status, Position, PrismaClient, PrismaPromise, Resolution, Trade, User } from "@/generated/prisma";
import { Candle } from "./types";
import { OrderWithRequiredPrice } from "../common/types";

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

export function addTradeToDB(trade: Trade){
    return prisma.trade.create({
        data: trade,
    })
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

export async function getAllOpenOrdersFromDB(){
    return await prisma.order.findMany({
        where: {
            status: Order_Status.OPEN,
        },
    });
}

export async function getLatestCandleFromDB(assetId: Asset["id"], resolution: Resolution){
    return await prisma.historical_Data.findFirst({
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
    }) as Candle;
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

export function getUsersWithPositionsFromDB(){
    return prisma.user.findMany({
		omit: {
			password: true,
		},
		include: {
			positions: true,
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