import { AccountMetrics, AccountMetricsResponse } from "@/lib/common/types";
import axios from "axios";
import { StateCreator } from "zustand";
import { AccountMetricsSlice, Store } from "./types";


export const createAccountMetricsSlice: StateCreator<Store, [], [], AccountMetricsSlice> = (set, get)=>({
    accountMetrics: null,
    fetchAccountMetrics: async ()=>{
        try{
            const {data}: {data: AccountMetrics} = await axios.get("/api/account_metrics");
            set(()=>({accountMetrics: data}));
        } catch(e){
			throw new Error("fetching accountMetrics went wrong: "+ (e instanceof Error ? e.message : String(e)));
        }
    }, 
    updateAccountMetrics: (update: AccountMetricsResponse) => {
        const {channel, ...accountMetrics} = update;
        set(()=>({accountMetrics}));
    },
    addToBalance(amount: number){
        set((state)=>{
            const accountMetrics = state.accountMetrics;
            if(accountMetrics){
                return {accountMetrics: {...accountMetrics, usdc: accountMetrics.usdc+amount}}
            }
            return {};
        })
    },
    deposit: async (amount: number) => {
        try{
            await axios.post("/api/deposit", {
                amount,
            });
            get().addToBalance(amount);
        } catch(e){
			throw new Error("deposit went wrong: "+ (e instanceof Error ? e.message : String(e)));
        }
    },
    withdraw: async (amount: number) => {
        try{
            await axios.post("/api/deposit", {
                amount: -amount,
            });
            get().addToBalance(-amount);
        } catch(e){
			throw new Error("withdraw went wrong: "+ (e instanceof Error ? e.message : String(e)));
        }
    }
});