import { Asset } from "@/generated/prisma";
import { useEffect, useState } from "react";
import { AccountMetrics, AccountMetricsResponse, Loadable, OrderbookDiffResponse, OrderBookLite, Prettify, WsResponse } from "@/lib/common/types";
import axios from "axios";
import { create, StateCreator } from "zustand";
import { AccountMetricsSlice, Store } from "./types";
import { addSubscriber, removeSubscriber, Subscriber } from "./socket";
import { useStore } from "./store";
import { usePnl } from "./positionsSlice";


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

const useInitializeAccountMetrics = (): "error" | "ready" =>{

    const [status, setStatus] = useState<"error" | "ready">("ready");

    const fetchAccountMetrics = useStore((state)=>state.fetchAccountMetrics);
    const updateAccountMetrics = useStore((state)=>state.updateAccountMetrics);

    const subscriber: Subscriber = {
        channel: "accountMetrics",
        callback: (response: WsResponse) => {
            if(response.channel === "accountMetrics") {
                updateAccountMetrics(response.message);
            }
        }
    }

    const initializeAccountMetrics = async () =>{
        try {
            addSubscriber(subscriber);
            await fetchAccountMetrics();
        } catch(e){
            console.error(e);
            setStatus("error");
        }
    }


    useEffect(() => {
        initializeAccountMetrics();
        return () => removeSubscriber(subscriber);
    }, []);

    return status;

}

const useAccountEquity = (): Loadable<number> => {
    const accountMetrics = useStore((state)=>state.accountMetrics);
    const pnl = usePnl();
    if(!accountMetrics || pnl.status==="loading") return {status: "loading"};

    const {usdc, unpaidFunding, initialMargin} = accountMetrics;

    const accountEquity = usdc + pnl.data - unpaidFunding - initialMargin;

    return {status: "ready", data: accountEquity};
    
}

const useAvailableEquity = (): Loadable<number> => {
    const accountMetrics = useStore((state)=>state.accountMetrics);
    const pnl = usePnl();
    if(!accountMetrics || pnl.status==="loading") return {status: "loading"};
    const {usdc, unpaidFunding, initialMargin, orderMargin} = accountMetrics;
    const availableEquity = usdc + pnl.data - unpaidFunding - initialMargin - orderMargin;
    return {status: "ready", data: availableEquity};
}

const useBalance = (): Loadable<number> =>{
    const accountMetrics = useStore((state)=>state.accountMetrics);
    if(!accountMetrics) return {status: "loading"};
    return {status: "ready", data: accountMetrics.usdc};
}