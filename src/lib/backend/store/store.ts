import { streamSpotPrices } from "../dataFetchers/spotFetcher";
import { streamMarkPrices } from "../dataFetchers/markFetcher";
import { getAllAssets, initializeAssets } from "./assetStore";
import { initializeLatestCandles } from "./candleStore";
import { initializeOrderbooks } from "./orderbookStore";
import { initializeMarkPrices, initializeSpotPrices } from "./priceStore";
import { getDetailedUsersState } from "./userStore";



// include here
export async function initializeStore() {
	await initializeAssets();
	await initializeLatestCandles();
	await initializeOrderbooks();
	await initializeMarkPrices();
	await getDetailedUsersState();
	await initializeSpotPrices();
	streamMarkPrices();
	streamSpotPrices();
	//   orderbooks = new Map<Asset["id"], OrderBook>(orderbookEntities);

	// getting user information

	// getting positions
}

