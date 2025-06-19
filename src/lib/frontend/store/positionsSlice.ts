import { Position } from "@/generated/prisma";
import {PositionDiffResponse} from "@/lib/common/types";
import axios from "axios";
import { getUpdatedPositions } from "../utils/positions";
import { StateCreator } from "zustand";
import { PositionsSlice, Store } from "./types";

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

