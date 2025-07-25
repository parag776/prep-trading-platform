import WebSocket from "ws";
import { Asset } from "@/generated/prisma";
import axios from "axios";
import { getAllAssets, getAssetFromSymbol } from "../store/assetStore";
import { updateSpotPrice } from "../store/priceStore";

export function streamSpotPrices() {
	const baseUrl = "wss://stream.binance.com:9443/";
	const streams = getAllAssets().map((asset) => asset.symbol.toLowerCase() + "usdc@miniTicker").join("/");

	const fullUrl = baseUrl + "stream?streams=" + streams;

	function getSymbolFromStream(stream: string) {
		let symbolLen = 0;
		for (let i = 0; i < stream.length; i++) {
			if (stream[i] === "@") {
				symbolLen = i;
				break;
			}
		}
		return stream.slice(0, symbolLen - 4).toUpperCase();
	}

	let attempts = 0;
	function connect() {
		const ws = new WebSocket(fullUrl);

		ws.on("open", ()=>{
			attempts = 0;
		})

		ws.on("message", (data) => {
			try {
				const dataObj = JSON.parse(data.toString());
				const assetId = getAssetFromSymbol(getSymbolFromStream(dataObj.stream)).id;
				updateSpotPrice(assetId, Number(dataObj.data.c));
			} catch (err) {
				console.error("Error parsing data for fetching stock prices:", err);
			}
		});

		ws.on("close", () => {
			attempts++;
			console.log("WebSocket for fetching stock prices closed. Reconnecting...");
			setTimeout(connect, Math.random()*Math.min(30000, Math.pow(2, attempts) * 100)); // exponential backoff
		});

		ws.on("error", (err) => {
			console.error("WebSocket for fetching stock prices error:", err);
			ws.close();
		});
	}
	connect();
}

export async function fetchHttpSpotPrice(asset: Asset): Promise<number> {
	const symbol = `${asset.symbol}USDC`; // e.g., BTCUSDC
	const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;

	const response = await axios.get(url);
	return Number(response.data.price);
}
