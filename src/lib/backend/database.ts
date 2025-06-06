import { Asset, Order, Position, PrismaClient, Resolution, User } from "@/generated/prisma";
import { Candle, OrderWithRequiredPrice } from "./types";

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

export function updateOrderInDB(order: Order){
    return prisma.order.update({
        where: {
            id: order.id
        },
        data: order
    })
}

export function updateLatestCandleToDB(assetId: Asset["id"], resolution: Resolution, candle: Candle ){
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
    })
    }

