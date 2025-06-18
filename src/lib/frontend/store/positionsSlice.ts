import { Position, Side } from "@/generated/prisma";
import { Loadable, PositionDiffResponse, WsResponse } from "@/lib/common/types";
import axios from "axios";
import { getUpdatedPositions } from "../utils/positions";
import { useEffect, useState } from "react";
import { addSubscriber, removeSubscriber, Subscriber } from "./socket";
import { useMarkPrices } from "./markPriceSlice";
import { StateCreator } from "zustand";
import { PositionsSlice, Store } from "./types";
import { useStore } from "./store";

export const createPositionsSlice: StateCreator<Store, [], [], PositionsSlice> = (set) => ({
	positions: null,
	updatePositions: (updates: Array<PositionDiffResponse>) => {
		set((state) => {
			if (state.positions) {
				return { positions: getUpdatedPositions(updates) };
			} else {
				return {};
			}
		});
	},
	fetchPositions: async () => {
		try {
			const positions: Array<Position> = await axios.get(`/api/positions`);
			set(() => ({ positions }));
		} catch (e) {
			throw new Error("Fetching positions went wrong: " + (e instanceof Error ? e.message : String(e)));
		}
	},
});

export const useInitializePositions = (): "error" | "ready" => {
	const [status, setStatus] = useState<"error" | "ready">("ready");

	const fetchPositions = useStore((state) => state.fetchPositions);
	const updatePositions = useStore((state) => state.updatePositions);
	const syncMarkPrice = useStore((state) => state.syncMarkPriceConnectionsWithPositionUpdates);

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
			addSubscriber(subscriber);
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

	const pnl = positions.data.reduce((pnl, position)=>{
		const markPrice = markPrices.data.get(position.id);
		if(!markPrice) return pnl;

		let profit = (markPrice - position.average_price)*position.quantity;

		if(position.side === Side.ASK) profit = -profit;
		pnl+=profit;

		return pnl;

	}, 0);

	return {status: "ready", data: pnl};

};
