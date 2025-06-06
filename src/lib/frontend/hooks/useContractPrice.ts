import { Asset } from "@/generated/prisma";
import { useContext, useEffect, useState } from "react";
import { SocketSubscribeContext } from "../context/SocketSubscribeContext";
import { useSocketSubscribe } from "./useSocketSubscribe";
import { WsResponse } from "@/lib/common/types";
import axios from "axios";

export function useContractPrice(assetId: Asset["id"]): null | number {

    const [contractPrice, setContractPrice] = useState<number | null>(null);

    useEffect(()=>{
        axios.get("/api/contractPrice").then(({data}: {data: {contractPrice: number}})=>{
            setContractPrice(data.contractPrice);
        })
    }, [])

	useSocketSubscribe("tradebook", assetId, (response: WsResponse) => {
        if(response.channel==="tradebook"){
            const message = response.message;
            const latestMessage = message[message.length - 1];
            if (latestMessage.channel === "tradebook") {
                setContractPrice(latestMessage.price);
            }
        }
	});

    return contractPrice;
}
