import { Asset, Position } from "@/generated/prisma";
import { Loadable, PositionDiffResponse, WsResponse } from "@/lib/common/types";
import axios from "axios";
import { create } from "zustand";
import { getUpdatedPositions } from "../utils/positions";
import { useEffect, useState } from "react";
import { addSubscriber, getSubscribers, removeSubscriber, Subscriber } from "./socket";
import { syncMarkPriceConnectionsWithPositionUpdates } from "./markPriceStore";

type PositionsStore = {
    positions: Array<Position> | null;
    updatePositions: (updates: Array<PositionDiffResponse>) => void;
    fetchPositions: () => Promise<void>;
}

const usePositionStore = create<PositionsStore>((set)=>({
    positions: null,
    updatePositions: (updates: Array<PositionDiffResponse>) =>{
		set((state)=>{
			if(state.positions){
				return {positions: getUpdatedPositions(updates)};
			} else {
				return {};
			}
		})
    },
    fetchPositions: async () =>{
		const positions: Array<Position> = await axios.get(`/api/positions`);
		set(()=>({positions}));
    }
}))

const useInitializePositions = (): "error" | "ready" => {
	const [status, setStatus] = useState<"error" | "ready">("ready");

	const fetchPositions = usePositionStore((state) => state.fetchPositions);
	const updatePositions = usePositionStore((state) => state.updatePositions);

	const subscriber: Subscriber = {
		channel: "positions",
		callback: (response: WsResponse) => {
			if (response.channel === "positions") {
				syncMarkPriceConnectionsWithPositionUpdates(response.message)
				updatePositions(response.message);
			}
		},
	};

	const initializePositions = async () => {
		try {
			addSubscriber(subscriber);
			await fetchPositions();
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

const usePositions = (): Loadable<Array<Position>> => {
	const positions = usePositionStore((state) => state.positions);

	if(positions) return {status: "ready", data: positions}
	return {status: "loading"};
};
