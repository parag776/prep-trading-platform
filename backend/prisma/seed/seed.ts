import { PrismaPromise } from "../../src/generated/prisma/client.js";
import fillAssets from "./asset.js";
import fillHistoricalData from "./historical_data.js";
import fillUsers from "./user.js";
import prisma from "./prismaClient.js";
import { fillOrders } from "./orders.js";

// adding all queries

async function main() {
	const seedingQueries = new Array<() => PrismaPromise<any>>();
	fillAssets(seedingQueries);
	fillUsers(seedingQueries);
	await fillHistoricalData(seedingQueries);
	// await fillOrders(seedingQueries);

	prisma
		.$transaction(seedingQueries.map((fn) => fn()))
		.then(async () => {
			console.log("successfully seeded.");
			await prisma.$disconnect();
		})
		.catch(async (e) => {
			console.log("something went wrong please seed again.", e);
			await prisma.$disconnect();
		});
}

main();

//seed should include historical data. thus, first lets generate historical data.
