import { TradeLite, TradeResponse } from "@/lib/common/types";
import { createTradebook, getUpdatedTradebook, TradeBook } from "@/lib/frontend/utils/tradebook";
import axios from "axios";
import { useEffect, useState, use } from "react";
import configData from "../../../../config.json"
import { Asset } from "@/generated/prisma";
import { useSocketSubscribe } from "./useSocketSubscribe";

export function useTradebook(asset: Asset) {
	const [tradebook, setTradebook] = useState<null | TradeBook>(null);

	useSocketSubscribe("tradebook", asset.id, (response)=>{
		if(response.channel==="tradebook"){
			setTradebook((tradebook)=>{
				return getUpdatedTradebook(tradebook ?? createTradebook(), response.message);
			})
		}
	})

	useEffect(() => {
		axios
			.get(`/api/trade_history?symbol=${asset.symbol}&limit=${configData.trade_book_size}`)
			.then(({ data }: {data: Array<TradeLite>}) => {
				const tradebook: TradeBook = {
					maxTradeBookSize: configData.trade_book_size,
					trades: data
				} 
				setTradebook(tradebook);
			})
			.catch(() => {
				throw new Error("tradebook fetching went wrong.");
			});
		setTradebook(tradebook)

		

	}, [asset]);

	return tradebook;
}
