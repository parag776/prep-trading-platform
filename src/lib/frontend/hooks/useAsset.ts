import { useContext } from "react";
import { AssetContext } from "../context/AssetContext";

export function useAsset(){
    const AssetContextValue = useContext(AssetContext);
    if(!AssetContextValue) return null;
    const { asset } = AssetContextValue;
    return asset;
}