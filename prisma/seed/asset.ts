import { PrismaPromise } from "../../src/generated/prisma";
import { v4 as uuid } from "uuid";
import prisma from "./prismaClient";


export const assets = [
	{
		id: uuid(),
		symbol: "SOL",
		name: "solana",
	},
	{
		id: uuid(),
		symbol: "BNB",
		name: "binance coin",
	},
	{
		id: uuid(),
		symbol: "BTC",
		name: "bitcoin",
	},
	{
		id: uuid(),
		symbol: "ETH",
		name: "ethereum",
	},
	{
		id: uuid(),
		symbol: "XRP",
		name: "xrp",
	},
];

export default function fillAssets(seedingQueries: Array<() => PrismaPromise<any>>) {
	seedingQueries.push(() =>
		prisma.asset.createMany({
			data: assets,
		})
	);
}
