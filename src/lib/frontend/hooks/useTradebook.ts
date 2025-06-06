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
		// axios
		// 	.get(`/api/trade_history?symbol=${asset.symbol}&limit=${configData.trade_book_size}`)
		// 	.then(({ data }: {data: Array<TradeLite>}) => {
		// 		const tradebook: TradeBook = {
		// 			maxTradeBookSize: configData.trade_book_size,
		// 			trades: data
		// 		} 
		// 		setTradebook(tradebook);
		// 	})
		// 	.catch(() => {
		// 		throw new Error("tradebook fetching went wrong.");
		// 	});

		
		const tradebook: TradeBook = {
		maxTradeBookSize: 100,
		trades: [
			{ id: "t1", price: 108500, quantity: 1.0, createdAt: new Date("2025-05-24T07:12:00.000Z") },
			{ id: "t2", price: 108450, quantity: 0.8, createdAt: new Date("2025-05-24T07:11:55.000Z") },
			{ id: "t3", price: 108470, quantity: 1.5, createdAt: new Date("2025-05-24T07:11:50.000Z") },
			{ id: "t4", price: 108520, quantity: 0.7, createdAt: new Date("2025-05-24T07:11:45.000Z") },
			{ id: "t5", price: 108490, quantity: 2.0, createdAt: new Date("2025-05-24T07:11:40.000Z") },
			{ id: "t6", price: 108480, quantity: 1.2, createdAt: new Date("2025-05-24T07:11:35.000Z") },
			{ id: "t7", price: 108510, quantity: 1.3, createdAt: new Date("2025-05-24T07:11:30.000Z") },
			{ id: "t8", price: 108530, quantity: 1.0, createdAt: new Date("2025-05-24T07:11:25.000Z") },
			{ id: "t9", price: 108500, quantity: 0.5, createdAt: new Date("2025-05-24T07:11:20.000Z") },
			{ id: "t10", price: 108490, quantity: 1.1, createdAt: new Date("2025-05-24T07:11:15.000Z") },
		]
		};

		setTradebook(tradebook)

		

	}, [asset]);

	return tradebook;
}
