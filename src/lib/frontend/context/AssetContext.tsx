
import { Asset } from "@/generated/prisma";
import axios from "axios";
import {createContext, ReactNode, useEffect, useState} from "react";

type AssetContextValue = {
    asset: Asset,
    updateAsset: (newAsset: Asset)=>void
}

export const AssetContext = createContext<AssetContextValue | null>(null);

export function AssetProvider({children}: {children: ReactNode}){

    const [asset, setAsset] = useState<Asset | null>(null)

    function updateAsset(newAsset: Asset){
        setAsset(newAsset);
    }

    useEffect(()=>{
        axios.get(`/api/asset?symbol=SOL`).then(({data}: {data: Asset})=>{
            setAsset(data)
        }).catch((e)=>{
            console.log(e)
        })
    }, [])

    if(!asset) return null;

    // change the value 
    return <AssetContext.Provider value={{asset, updateAsset}}>
        {children}
    </AssetContext.Provider>
}

