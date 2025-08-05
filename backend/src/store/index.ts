import { streamSpotPrices } from "../dataFetchers/spotFetcher.js";
import { streamMarkPrices } from "../dataFetchers/markFetcher.js";
import { initializeAssets } from "./assetStore.js";
import { initializeLatestCandles } from "./candleStore.js";
import { initializeOrderbooks } from "./orderbookStore.js";
import { initializeMarkPrices, initializeSpotPrices } from "./priceStore.js";
import { getDetailedUsersState } from "./userStore.js";
import { initializeFundingMechanism } from "../jobs/fundingJob.js";
import { initializeMarketMaker } from "../jobs/marketMakerJob.js";

// include here
export async function initialization() {
	await initializeAssets();
	await initializeLatestCandles();
	await initializeOrderbooks();
	await initializeMarkPrices();
	await getDetailedUsersState();
	await initializeSpotPrices();
	streamMarkPrices();
	streamSpotPrices();
	initializeFundingMechanism();
	initializeMarketMaker();
}
