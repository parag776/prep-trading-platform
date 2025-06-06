import { Asset } from "@/generated/prisma";
import { OrderBookLite } from "@/lib/common/types";
import { createOrderbook, getUpdatedOrderbook } from "@/lib/frontend/utils/orderbook";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSocketSubscribe } from "./useSocketSubscribe";
import { getArrayWithKeys } from "../utils/misc";

// rather than using isLoading, i am relying on the fact if orderbook is null or not.
export function useOrderbook(asset: Asset) {
	const [orderbook, setOrderbook] = useState<null | OrderBookLite>(null);

	useSocketSubscribe("orderbook", asset.id, (response) => {
		if (response.channel === "orderbook") {
			setOrderbook((orderbook) => {
				return getUpdatedOrderbook(orderbook ?? createOrderbook(), response.message);
			});
		}
	});

	useEffect(() => {
		setOrderbook({
			lastOrderTimestamp: new Date("2025-05-24T07:12:22.619Z"),
			askOrderbook: {
				side: "ASK",
				orders: [
					{ price: 108500, quantity: 1.25, cumulativeQuantity: 1.25, side: "ASK" },
					{ price: 108600, quantity: 2.1, cumulativeQuantity: 3.35, side: "ASK" },
					{ price: 108700, quantity: 0.9, cumulativeQuantity: 4.25, side: "ASK" },
					{ price: 108500, quantity: 1.25, cumulativeQuantity: 1.25, side: "ASK" },
					{ price: 108600, quantity: 2.1, cumulativeQuantity: 3.35, side: "ASK" },
					{ price: 108700, quantity: 0.9, cumulativeQuantity: 4.25, side: "ASK" },
					{ price: 108500, quantity: 1.25, cumulativeQuantity: 1.25, side: "ASK" },
					{ price: 108600, quantity: 2.1, cumulativeQuantity: 3.35, side: "ASK" },
					{ price: 108700, quantity: 0.9, cumulativeQuantity: 4.25, side: "ASK" },
					{ price: 108800, quantity: 1.0, cumulativeQuantity: 5.25, side: "ASK" },
					{ price: 108900, quantity: 2.3, cumulativeQuantity: 7.55, side: "ASK" },
					{ price: 109000, quantity: 1.1, cumulativeQuantity: 8.65, side: "ASK" },
					{ price: 109100, quantity: 1.6, cumulativeQuantity: 10.25, side: "ASK" },
					{ price: 109200, quantity: 1.0, cumulativeQuantity: 11.25, side: "ASK" },
					{ price: 109300, quantity: 0.5, cumulativeQuantity: 11.75, side: "ASK" },
					{ price: 109400, quantity: 0.75, cumulativeQuantity: 12.5, side: "ASK" },
					{ price: 109500, quantity: 1.0, cumulativeQuantity: 13.5, side: "ASK" },
					{ price: 109600, quantity: 2.0, cumulativeQuantity: 15.5, side: "ASK" },
					{ price: 109700, quantity: 1.3, cumulativeQuantity: 16.8, side: "ASK" },
					{ price: 109800, quantity: 0.6, cumulativeQuantity: 17.4, side: "ASK" },
					{ price: 109900, quantity: 0.9, cumulativeQuantity: 18.3, side: "ASK" },
				],
			},
			bidOrderbook: {
				side: "BID",
				orders: [
					{ price: 108400, quantity: 1.0, cumulativeQuantity: 1.0, side: "BID" },
					{ price: 108300, quantity: 1.2, cumulativeQuantity: 2.2, side: "BID" },
					{ price: 108200, quantity: 0.8, cumulativeQuantity: 3.0, side: "BID" },
					{ price: 108100, quantity: 1.5, cumulativeQuantity: 4.5, side: "BID" },
					{ price: 108000, quantity: 0.75, cumulativeQuantity: 5.25, side: "BID" },
					{ price: 107900, quantity: 1.25, cumulativeQuantity: 6.5, side: "BID" },
					{ price: 107800, quantity: 0.9, cumulativeQuantity: 7.4, side: "BID" },
					{ price: 107700, quantity: 1.1, cumulativeQuantity: 8.5, side: "BID" },
					{ price: 107600, quantity: 1.0, cumulativeQuantity: 9.5, side: "BID" },
					{ price: 107500, quantity: 0.5, cumulativeQuantity: 10.0, side: "BID" },
					{ price: 107400, quantity: 1.7, cumulativeQuantity: 11.7, side: "BID" },
					{ price: 107300, quantity: 1.8, cumulativeQuantity: 13.5, side: "BID" },
					{ price: 107200, quantity: 1.0, cumulativeQuantity: 14.5, side: "BID" },
					{ price: 107100, quantity: 1.5, cumulativeQuantity: 16.0, side: "BID" },
					{ price: 106000, quantity: 2.0, cumulativeQuantity: 18.0, side: "BID" },
					{ price: 105000, quantity: 2.0, cumulativeQuantity: 18.0, side: "BID" },
					{ price: 104000, quantity: 2.0, cumulativeQuantity: 18.0, side: "BID" },
					{ price: 103000, quantity: 2.0, cumulativeQuantity: 18.0, side: "BID" },
					{ price: 102000, quantity: 2.0, cumulativeQuantity: 18.0, side: "BID" },
					{ price: 101000, quantity: 2.0, cumulativeQuantity: 18.0, side: "BID" },
					{ price: 100000, quantity: 2.0, cumulativeQuantity: 18.0, side: "BID" },
				],
			},
		});
		// axios
		// 	.get(`/api/orderbook?symbol=${asset.symbol}`)
		// 	.then(({ data }: { data: OrderBookLite }) => {
		// 		setOrderbook(data);
		// 	})
		// 	.catch(() => {
		// 		throw new Error("orderbook fetching went wrong.");
		// 	});
	}, [asset]);

	return orderbook;
}
