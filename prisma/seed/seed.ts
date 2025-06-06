import { PrismaPromise } from "../../src/generated/prisma";
import fillAssets from "./asset";
import fillHistoricalData from "./historical_data";
import fillUsers from "./user";
import prisma from "./prismaClient";
import { fillOrders } from "./orders";


// adding all queries

async function main() {
	const seedingQueries = new Array<() => PrismaPromise<any>>();
	fillAssets(seedingQueries);
	await fillHistoricalData(seedingQueries);
	fillUsers(seedingQueries);
    await fillOrders(seedingQueries);

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
