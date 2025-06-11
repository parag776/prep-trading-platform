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
		axios
			.get(`/api/orderbook?symbol=${asset.symbol}`)
			.then(({ data }: { data: OrderBookLite }) => {
				setOrderbook(data);
			})
			.catch(() => {
				throw new Error("orderbook fetching went wrong.");
			});
	}, [asset]);

	return orderbook;
}
