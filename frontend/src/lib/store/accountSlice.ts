import type { AccountMetrics, AccountMetricsResponse } from "../../../../shared/types.mjs";
import axios from "axios";
import type { StateCreator } from "zustand";
import type { AccountSlice, Store } from "./types";
import type { UserIdentity } from "../../../../shared/types.mts";

export const createAccountSlice: StateCreator<Store, [], [], AccountSlice> = (set, get) => ({
	accountMetrics: null,
	userIdentity: null,
	fetchAccountMetrics: async () => {
		try {
			const { data }: { data: AccountMetrics } = await axios.get(`/api/user/account-metrics`);
			set(() => ({ accountMetrics: data }));
		} catch (e) {
			throw new Error("fetching accountMetrics went wrong: " + (e instanceof Error ? e.message : String(e)));
		}
	},
	fetchUserIdentity: async () => {
		try{
			const {data}: {data: UserIdentity} = await axios.get(`/api/user/user-identity`);
			set(()=>({userIdentity: data}));
		} catch(e) {
			throw new Error("fetching userIdentity went wrong: " + (e instanceof Error ? e.message : String(e)));
		}

	},
	updateAccountMetrics: (update: AccountMetricsResponse) => {
		const { channel, ...accountMetrics } = update;
		set(() => ({ accountMetrics }));
	},
	addToBalance(amount: number) {
		set((state) => {
			const accountMetrics = state.accountMetrics;
			if (accountMetrics) {
				return { accountMetrics: { ...accountMetrics, usdc: accountMetrics.usdc + amount } };
			}
			return {};
		});
	},
	deposit: async (amount: number) => {
		try {
			await axios.post(`/api/deposit`, {
				amount,
			});
			get().addToBalance(amount);
		} catch (e) {
			throw new Error("deposit went wrong: " + (e instanceof Error ? e.message : String(e)));
		}
	},
	withdraw: async (amount: number) => {
		try {
			await axios.post(`/api/deposit`, {
				amount: -amount,
			});
			get().addToBalance(-amount);
		} catch (e) {
			throw new Error("withdraw went wrong: " + (e instanceof Error ? e.message : String(e)));
		}
	},
});
