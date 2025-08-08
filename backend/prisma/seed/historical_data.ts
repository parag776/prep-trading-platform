import { Historical_Data, PrismaPromise, Resolution } from "../../src/generated/prisma/client.js";

import { assets } from "./asset.js";
import axios, { AxiosResponse } from "axios";
import prisma from "./prismaClient.js";
import { getAllResolutionData } from "./utils.js";

const futureKlinesURL = "https://fapi.binance.com/fapi/v1/klines";

// its 900, because max limit is 1500 candles per minute
// and weight above 1000 is 10 for rate limit
const candlesPerRequest = 900;

// change only this for testing original was 60*24*30*2
// fetching data for 2 months because of rate limits.
const totalCandles = 60 * 24 * 2; // 2 months, each candle being 1 minute each.
const numberOfRequests = totalCandles / candlesPerRequest;
const millisecondsInAMinute = 60 * 1000;

const timeDiff = candlesPerRequest * millisecondsInAMinute;
const endTime = Math.floor(Date.now() / 60000) * 60000;

const startTime = endTime - (totalCandles - 1) * millisecondsInAMinute;

async function getHistoricalData() {
	const data = Array<any>();
	for (const asset of assets) {
		const { symbol } = asset;

		let curEndTime = endTime;
		let curStartTime = endTime - timeDiff + millisecondsInAMinute;

		const candleData = Array<any>();

		console.log("fetching data for ", asset);

		while (curEndTime >= startTime) {
			const params = {
				startTime: curStartTime,
				endTime: curEndTime,
				symbol: symbol + "USDC",
				interval: "1m",
				limit: candlesPerRequest,
			};

			candleData.push(
				(
					await axios.get(futureKlinesURL, {
						params,
					})
				).data.reverse()
			);
			console.log(`got data ${candlesPerRequest} candles from ${curStartTime.toString()} till ${curEndTime.toString()} for asset ${asset}`);

			curEndTime = Math.max(curEndTime - timeDiff, startTime - 1); // subtracting 1 to end the while loop.
			curStartTime = Math.max(curStartTime - timeDiff, startTime);
		}

		data.push(
			candleData.flat().map((candle) => {
				return {
					assetId: asset.id,
					resolution: Resolution.ONE_MINUTE,
					timestamp: new Date(Number(candle[0])),
					open: Number(candle[1]),
					high: Number(candle[2]),
					low: Number(candle[3]),
					close: Number(candle[4]),
					volume: Number(candle[5]),
				} as Historical_Data;
			})
		);
	}
	return data.map((assetData) => getAllResolutionData(assetData)).flat();
}

export default async function fillHistoricalData(seedingQueries: Array<() => PrismaPromise<any>>) {
	const data = await getHistoricalData();

	seedingQueries.push(() => {
		return prisma.historical_Data.createMany({
			data,
		});
	});
}
