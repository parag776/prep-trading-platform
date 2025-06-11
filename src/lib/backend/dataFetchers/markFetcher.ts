import WebSocket from "ws";
import { assets, markPrices, spotPrices, symbolToAssetId } from "../store";
import { Asset } from "@/generated/prisma";
import axios from "axios";

export function streamMarkPrices() {
	const baseUrl = "wss://fstream.binance.com/";
	const streams = assets.map((asset) => asset.symbol.toLowerCase() + "usdc@markPrice@1s").join("/");

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

	function connect() {
		const ws = new WebSocket(fullUrl);
		ws.on("message", (data) => {
			try {
				const dataObj = JSON.parse(data.toString());
				let symbol = getSymbolFromStream(dataObj.stream);
				const assetId = symbolToAssetId.get(symbol)!;
                console.log(Number(dataObj.data.p))
				markPrices.set(assetId, Number(dataObj.data.p));
			} catch (err) {
				console.error("Error parsing data for fetching mark prices:", err);
			}
		});

		ws.on("close", () => {
			console.log("WebSocket for fetching mark prices closed. Reconnecting...");
			setTimeout(connect, 1000); // Wait 1s before reconnect
		});

		ws.on("error", (err) => {
			console.error("WebSocket for fetching mark prices error:", err);
			ws.close();
		});
	}
	connect();
}

export async function fetchHttpMarkPrice(asset: Asset): Promise<number> {
	const symbol = `${asset.symbol}USDC`; // e.g., BTCUSDC
	const url = `https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${asset.symbol}USDC`;

	const response = await axios.get(url);
	return Number(response.data.price);
}

streamMarkPrices()