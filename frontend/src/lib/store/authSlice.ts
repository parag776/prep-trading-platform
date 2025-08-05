import axios from "axios";
import type { StateCreator } from "zustand";
import type { AuthSlice, Store } from "./types";
import type { UserIdentity } from "../../../../shared/types.mjs";

export const createAuthSlice: StateCreator<Store, [], [], AuthSlice> = (set) => ({
	authenticationStatus: "unauthenticated",
	localRegister: async (name: string, username: string, password: string) => {
		try {
			set(() => ({ authenticationStatus: "loading" }));
			const { data }: { data: UserIdentity } = await axios.post(`/api/auth/local/register`, { name, username, password });
			set(() => ({ userIdentity: data }));
			set(() => ({ authenticationStatus: "authenticated" }));
		} catch (e) {
			set(() => ({ authenticationStatus: "unauthenticated" }));
			throw e;
		}
	},
	localSignIn: async (username: string, password: string) => {
		try {
			set(() => ({ authenticationStatus: "loading" }));
			const { data }: { data: UserIdentity } = await axios.post(`/api/auth/local/login`, { username, password });
			set(() => ({ userIdentity: data }));
			set(() => ({ authenticationStatus: "authenticated" }));
		} catch (e) {
			set(() => ({ authenticationStatus: "unauthenticated" }));
			throw e;
		}
	},
	signOut: async () => {
		try {
			set(() => ({ authenticationStatus: "loading" }));
			await axios.post(`/api/auth/logout`);
			set(() => ({ userIdentity: null }));
			set(() => ({ authenticationStatus: "unauthenticated" }));
		} catch (e) {
			set(() => ({ authenticationStatus: "unauthenticated" }));
			throw e;
		}
	},
	verifyUserAuthenticationRemote: async () => {
		try {
			set(() => ({ authenticationStatus: "loading" }));
			// Use the fetchUserIdentity function from the account slice to check authentication
			const { data }: { data: UserIdentity } = await axios.get(`/api/user/user-identity`);
			set(() => ({ userIdentity: data, authenticationStatus: "authenticated" }));
		} catch (e) {
			set(() => ({ authenticationStatus: "unauthenticated", userIdentity: null }));
		}
	},
});
