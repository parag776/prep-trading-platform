import React, { useEffect, useRef } from "react";
import { useUpdateAsset } from "../../lib/hooks/assetHooks";

function AssetDropdown({
	isDropdownActive,
	setIsDropdownActive,
    symbolRef,
	assets
}: {
	isDropdownActive: boolean;
	setIsDropdownActive: React.Dispatch<React.SetStateAction<boolean>>;
    symbolRef: React.RefObject<HTMLDivElement | null>;
	assets: {
		symbol: string;
		name: string;
		id: string;
	}[]
}) {

	const updateAsset = useUpdateAsset()

	const dropdownRef = useRef<null | HTMLDivElement>(null);
    if(dropdownRef.current){
        dropdownRef.current.style.display = isDropdownActive?"":"none";
    }

	useEffect(() => {
		const handler = (e: globalThis.MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && !symbolRef.current?.contains(e.target as Node)) {
				setIsDropdownActive(false);
			}
		};

		const doc = dropdownRef.current?.ownerDocument;
		doc?.addEventListener("mousedown", handler);

		return () => {
			doc?.removeEventListener("mousedown", handler);
		};
	}, []);

	return <div className="overflow-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-100 absolute top-20 shadow-md shadow-black text-light-gray bg-background-2 z-50 rounded-2xl" ref={dropdownRef} style={{display: "none"}}>
		{assets.map((asset)=><div key={asset.id} className="text-center p-4 text-bold hover:bg-background-4 flex items-center justify-between" onClick={()=>updateAsset(asset.id)}>
			<div className="flex items-center font-semibold">
			<img src={`./icons/${asset.symbol.toLowerCase()}.png`} className="mr-2" />
			<span className="mr-8">{asset.symbol}/USDC</span>
			</div>
			 <span className="bg-[#541A2E] rounded-xl p-1 text-[#FFA586] text-sm font-semibold">100x</span>
		</div>)}
	</div>;
}

export default AssetDropdown;
