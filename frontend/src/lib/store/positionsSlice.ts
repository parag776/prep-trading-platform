import type { Position } from "../../../../backend/src/generated/prisma";
import type { PositionDiffResponse } from "../../../../shared/types.mjs";
import axios from "axios";
import { getUpdatedPositions } from "../utils/positions";
import type { StateCreator } from "zustand";
import type { PositionsSlice, Store } from "./types";

export const createPositionsSlice: StateCreator<Store, [], [], PositionsSlice> = (set) => ({
	positions: null,
	updatePositions: (updates: Array<PositionDiffResponse>) => {
		set((state) => {
			if (state.positions) {
				return { positions: getUpdatedPositions(state.positions, updates) };
			} else {
				return {};
			}
		});
	},
	fetchPositions: async () => {
		try {
			const positions: Array<Position> = (await axios.get(`/api/user/positions`)).data;
			set(() => ({ positions }));
		} catch (e) {
			throw new Error("Fetching positions went wrong: " + (e instanceof Error ? e.message : String(e)));
		}
	},
});
