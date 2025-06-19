import { AccountMetrics, AccountMetricsResponse } from "@/lib/common/types";
import axios from "axios";
import { StateCreator } from "zustand";
import { AccountMetricsSlice, Store } from "./types";


export const createAccountMetricsSlice: StateCreator<Store, [], [], AccountMetricsSlice> = (set)=>({
    accountMetrics: null,
    fetchAccountMetrics: async ()=>{
        try{
            const {data}: {data: AccountMetrics} = await axios.get("/api/account_metrics");
            set((state)=>({accountMetrics: data}));
        } catch(e){
			throw new Error("fetching accountMetrics went wrong: "+ (e instanceof Error ? e.message : String(e)));
        }
    }, 
    updateAccountMetrics: (update: AccountMetricsResponse) => {
        const {channel, ...accountMetrics} = update;
        set((state)=>({accountMetrics}));
    }
});