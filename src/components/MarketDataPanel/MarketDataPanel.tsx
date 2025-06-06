import React, { useState } from "react";
import Switch from "../Switch";
import OrderBook from "./OrderbookComponent";
import TradeBook from "./TradeBookComponent";
import { useAsset } from "@/lib/frontend/hooks/useAsset";
import Loading from "../Loading";
import { useOrderbook } from "@/lib/frontend/hooks/useOrderbook";
import { useTradebook } from "@/lib/frontend/hooks/useTradebook";

function MarketDataPanel() {
	const choiceArray = ["Book", "Trades"];
	const [choice, SetChoice] = useState("Book");

	const asset = useAsset();
	if (!asset) return <Loading />;
	const orderbook = useOrderbook(asset);
	const tradebook = useTradebook(asset);

	if(!orderbook || !tradebook) return <Loading/>
	
	// get decimalPoints
	const decimalPoints = {
		quantity: 2,
		price: 2,
	};
	const askOrders = orderbook.askOrderbook.orders;
	const bidOrders = orderbook.bidOrderbook.orders;
	if (askOrders.length) {
		decimalPoints.quantity = Math.min(
			6,
			Math.floor(Math.log10(askOrders[askOrders.length - 1].price))
		);
		decimalPoints.price = Math.max(
			0,
			6 - Math.floor(Math.log10(askOrders[askOrders.length - 1].price))
		);
	} else if (bidOrders.length) {
		decimalPoints.quantity = Math.max(6, Math.log10(bidOrders[0].price));
		decimalPoints.price = Math.max(0, 6 - Math.floor(Math.log10(bidOrders[0].price)));
	}

	const trades = tradebook.trades;

	// get price color
	let priceColor = "#05AD6D"; //  green (default)
	if (trades.length >= 2) {
		if (trades[0].price >= trades[1].price) priceColor = "#05AD6D"; // green (increase in price)
		else priceColor = "#DD4548"; // red (decrease in price);
	}


	return (
		<div className="bg-background-2 rounded-xl h-full w-full">
			<div className="p-4 h-[60px]">
				<Switch choiceArray={choiceArray} choice={choice} setChoice={SetChoice} />
			</div>
			<div className="p-3 h-[calc(100%-60px)]">
				{choice === "Book" ? (
					<OrderBook orderbook={orderbook} asset={asset} tradebook={tradebook} decimalPoints={decimalPoints} priceColor={priceColor}/>
				) : (
					<TradeBook tradebook={tradebook} asset={asset} decimalPoints={decimalPoints}/>
				)}
			</div>
		</div>
	);
}

export default MarketDataPanel;
