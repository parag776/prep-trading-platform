import { Historical_Data, Side } from "./generated/prisma/client.js";
import { resolutionInfo } from "../../shared/data.mjs";
import config from "../../shared/config.mjs";
import { UserWithPositionsAndOpenOrders } from "./types.js";
import { getMarkPrice } from "./store/priceStore.js";
import { AppError } from "../../shared/error.mjs";
import * as z from "zod";

export function calculateMarginWithoutFee(price: number, quantity: number, leverage: number) {
	return (price * quantity) / leverage;
}

export function calculateFee(price: number, quantity: number, leverage: number, feeRate: number) {
	return ((price * quantity) / leverage) * feeRate;
}

export function calculateMarginWithFee(price: number, quantity: number, leverage: number, fee: number) {
	return ((price * quantity) / leverage) * (1 + fee);
}

export function calculateMaintenanceMargin(price: number, quantity: number) {
	return price * quantity * config.maintainence_margin;
}

export function getSecondsFromDate(date: Date) {
	return Math.floor(date.getTime() / 1000);
}

export function getAllResolutionData(data: Array<Historical_Data>) {
	const allResolutionData = new Array<Historical_Data>();
	const millisecondsInAMinute = 60 * 1000;

	for (const resolution of resolutionInfo) {
		let curCandle: Historical_Data = structuredClone(data[0]);
		curCandle.resolution = resolution[0];
		let endTime = curCandle.timestamp.getTime();

		for (let i = 1; i < data.length; i++) {
			if ((data[i].timestamp.getTime() + millisecondsInAMinute) % resolution[1].duration === 0) {
				// start of new candle time curtime%duration = -1
				endTime = data[i].timestamp.getTime();
				curCandle.timestamp = structuredClone(data[i - 1].timestamp);
				allResolutionData.push(curCandle);
				curCandle = structuredClone(data[i]);
				curCandle.resolution = resolution[0];
			}

			curCandle.low = Math.min(data[i].low, curCandle.low);
			curCandle.high = Math.max(data[i].high, curCandle.high);
			curCandle.open = data[i].open;
			curCandle.volume += data[i].volume;
			// close is already taken into account.
		}

		const candleStart = Math.floor(data[data.length - 1].timestamp.getTime() / resolution[1].duration) * resolution[1].duration;
		curCandle.timestamp = new Date(candleStart);
		allResolutionData.push(curCandle);
	}

	return allResolutionData;
}

export function calculateUserPnl(user: UserWithPositionsAndOpenOrders) {
	let pnl = 0;
	for (const [positionId, position] of user.positions) {
		let profit = (getMarkPrice(position.assetId) - position.average_price) * position.quantity;
		if (position.side === Side.ASK) {
			profit = -profit;
		}
		pnl += profit;
	}
	return pnl;
}

export function fixedGapSetInterval(cb: () => Promise<void> | void, ms: number) {
	setTimeout(async () => {
		await cb();
		fixedGapSetInterval(cb, ms);
	}, ms);
}

function isPrismaError(err: any): err is { code: string; meta?: any } {
	return (
		err && typeof err === "object" && typeof err.code === "string" && "clientVersion" in err // Prisma errors always have this
	);
}

export function parseError(err: any): [number, string] {
	if (err instanceof z.ZodError) {
		return [403, err.issues[0].message || "Invalid request"];
	} else if (err instanceof AppError) {
		return [err.status, err.message];
	} else if (isPrismaError(err)) {
		let message = "A database error occurred.";

		switch (err.code) {
			case "P2002":
				message = `${err.meta?.target?.join(", ") || "Value"} already exists.`;
				break;

			case "P2003":
				// Foreign key violation → invalid reference
				message = `${err.meta?.field_name || "Field"} is invalid.`;
				break;

			case "P2025":
				// Record not found
				message = `${err.meta?.cause || "Record"} not found.`;
				break;
		}
		return [400, message];
	} else if (err instanceof Error) {
		return [500, err.message];
	} else {
		return [500, "internal server error."];
	}
}
