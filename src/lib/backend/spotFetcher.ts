import WebSocket from "ws";
import { assets, spotPrices, symbolToAssetId } from "./store";

export function fetchSpotPrices() {
  const baseUrl = "wss://stream.binance.com:9443/";
  const streams = assets
    .map((asset) => asset.symbol.toLowerCase() + "usdc@miniTicker")
    .join("/");

  const fullUrl = baseUrl + "stream?streams=" + streams;

  function getSymbolFromStream(stream: string) {
    let symbolLen = 0;
    for (let i = 0; i < stream.length; i++) {
      if (stream[i] === "@") {
        symbolLen = i;
        break;
      }
    }
    return stream.slice(0, symbolLen-4).toUpperCase();
  }

  function connect() {
    const ws = new WebSocket(fullUrl);
    ws.on("message", (data) => {
      try {
        const dataObj = JSON.parse(data.toString());
        let symbol = getSymbolFromStream(dataObj.stream);
        const assetId = symbolToAssetId.get(symbol)!;
        spotPrices.set(assetId, Number(dataObj.data.c))
      } catch (err) {
        console.error("Error parsing data for fetching stock prices:", err);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket for fetching stock prices closed. Reconnecting...");
      setTimeout(connect, 1000); // Wait 1s before reconnect
    });

    ws.on("error", (err) => {
      console.error("WebSocket for fetching stock prices error:", err);
      ws.close();
    });
  }
  connect();
}
