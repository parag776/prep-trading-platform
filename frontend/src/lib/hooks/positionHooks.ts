import type { Position } from "../../../../backend/src/generated/prisma";
import type { Loadable, LoadStatus, WsResponse } from "../../../../shared/types.mjs";
import { useEffect, useState } from "react";
import { useMarkPrices } from "./pricesHooks";
import { addSubscriber, removeSubscriber, type Subscriber } from "../store/socket";
import { useStore } from "../store/store";

export const useInitializePositions = (): LoadStatus => {
	const [status, setStatus] = useState<LoadStatus>("loading");

	const fetchPositions = useStore((state) => state.fetchPositions);
	const updatePositions = useStore((state) => state.updatePositions);
	const syncMarkPrice = useStore((state) => state.syncMarkPriceConnectionsWithPositionUpdates);
	const initializePositionMarkPrices = useStore((state) => state.initializePositionMarkPrices);

	const subscriber: Subscriber = {
		channel: "positions",
		callback: (response: WsResponse) => {
			if (response.channel === "positions") {
				syncMarkPrice(response.message);
				updatePositions(response.message);
			}
		},
	};

	const initializePositions = async () => {
		try {
			await fetchPositions();
			await initializePositionMarkPrices();
			
			addSubscriber(subscriber);
			setStatus("ready");
		} catch (e) {
			console.error(e);
			setStatus("error");
		}
	};

	useEffect(() => {
		initializePositions();
		return () => removeSubscriber(subscriber);
	}, []);

	return status;
};

export const usePositions = (): Loadable<Array<Position>> => {
	const positions = useStore((state) => state.positions);
	if (positions) return { status: "ready", data: positions };
	return { status: "loading" };
};

export const usePnl = (): Loadable<number> => {
	const positions = usePositions();
	const markPrices = useMarkPrices();

	if (positions.status === "loading" || markPrices.status === "loading") return { status: "loading" };

	const pnl = positions.data.reduce((pnl, position) => {
		const markPrice = markPrices.data.get(position.id);
		if (!markPrice) return pnl;

		let profit = (markPrice - position.average_price) * position.quantity;

		if (position.side === "ASK") profit = -profit;
		pnl += profit;

		return pnl;
	}, 0);

	return { status: "ready", data: pnl };
};
