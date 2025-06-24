import { useEffect, useState } from "react";
import { Loadable, WsResponse, LoadStatus } from "@/lib/common/types";
import { addSubscriber, removeSubscriber, Subscriber } from "../store/socket";
import { useStore } from "../store/store";
import { usePnl } from "./positionHooks";
import {useSession} from "next-auth/react";

export const useInitializeAccountMetrics = (): LoadStatus =>{

    const [status, setStatus] = useState<LoadStatus>("loading");
    const {status: authStatus} = useSession();

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
            await fetchAccountMetrics();
            addSubscriber(subscriber);
            setStatus("ready");
        } catch(e){
            console.error(e);
            setStatus("error");
        }
    }

    useEffect(() => {
        if(authStatus==="authenticated"){
            initializeAccountMetrics();
            return () => removeSubscriber(subscriber);
        }
    }, [authStatus]);

    return status;

}

export const useAccountEquity = (): Loadable<number> => {
    const accountMetrics = useStore((state)=>state.accountMetrics);
    const pnl = usePnl();
    if(!accountMetrics || pnl.status==="loading") return {status: "loading"};
    const {usdc, unpaidFunding, initialMargin} = accountMetrics;
    const accountEquity = usdc + pnl.data - unpaidFunding - initialMargin;
    return {status: "ready", data: accountEquity};
}

export const useAvailableEquity = (): Loadable<number> => {
    const accountMetrics = useStore((state)=>state.accountMetrics);
    const pnl = usePnl();
    if(!accountMetrics || pnl.status==="loading") return {status: "loading"};
    const {usdc, unpaidFunding, initialMargin, orderMargin} = accountMetrics;
    const availableEquity = usdc + pnl.data - unpaidFunding - initialMargin - orderMargin;
    return {status: "ready", data: availableEquity};
}

export const useBalance = (): Loadable<number> =>{
    const accountMetrics = useStore((state)=>state.accountMetrics);
    if(!accountMetrics) return {status: "loading"};
    return {status: "ready", data: accountMetrics.usdc};
}

export const useDeposit = ()=>{
    const deposit = useStore((state)=>state.deposit);
    return deposit;
}

export const useWithdraw = ()=>{
    const withdraw = useStore((state)=>state.withdraw);
    return withdraw;
}