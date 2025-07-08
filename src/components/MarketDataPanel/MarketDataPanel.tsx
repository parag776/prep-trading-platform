"use client"
import React, { useState } from "react";
import Switch from "../Switch";
import OrderBook from "./OrderbookComponent";
import TradeBook from "./TradeBookComponent";
import Loading from "../Loading";
import { useAsset } from "@/lib/frontend/hooks/assetHooks";
import { useInitializeTradebook } from "@/lib/frontend/hooks/tradebookHooks";
import { useInitializeOrderbook } from "@/lib/frontend/hooks/orderbookHooks";

function MarketDataPanel() {
	const choiceArray = ["Book", "Trades"];
	const [choice, SetChoice] = useState("Book");

	const asset = useAsset();
	const tradebookStatus = useInitializeTradebook(asset);
	const orderbookStatus = useInitializeOrderbook(asset);
	if (asset.status === "loading") return <Loading />;

	if (tradebookStatus === "error" || orderbookStatus === "error") return <Loading />; // should be error here.

	return (
		<div className="bg-background-2 rounded-xl h-full w-full">
			<div className="p-4 h-[60px]">
				<Switch choiceArray={choiceArray} choice={choice} setChoice={SetChoice} />
			</div>
			<div className="p-3 h-[calc(100%-60px)]">{choice === "Book" ? <OrderBook /> : <TradeBook />}</div>
		</div>
	);
}

export default MarketDataPanel;
