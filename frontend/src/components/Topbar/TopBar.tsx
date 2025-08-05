import { useEffect, useRef, useState } from "react";
import { useAllAssets, useAsset, useCurrentFundingRate} from "../../lib/hooks/assetHooks";
import Loading from "../Loading";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import AssetDropdown from "./AssetDropdown";
import { useTradebook } from "../../lib/hooks/tradebookHooks";
import { getCurrentPrice, getPriceDirection } from "../../lib/utils/misc";
import { useCurrentMarkPrice } from "../../lib/hooks/pricesHooks";
import Tooltip from "../utilities/Tooltip";

function TopBar() {
	const asset = useAsset();
	const assets = useAllAssets();
	const tradebook = useTradebook();
	const markPrice = useCurrentMarkPrice();
	const fundingRate = useCurrentFundingRate();
	const countdownRef = useRef<null | HTMLSpanElement>(null);

	const [isDropdownActive, setIsDropdownActive] = useState(false);
	const symbolRef = useRef<null | HTMLDivElement>(null);

	useEffect(()=>{

		const countdownInterval = setInterval(()=>{

			const curTime = Date.now();
			const hourInMs = 1000 * 60 * 60 
			const minuteInMs = 1000 * 60;
			const secondInMs = 1000;
		
			const hourClock = 7 - Math.floor((curTime % (8*hourInMs))/hourInMs);
			const minuteClock = 59 - Math.floor((curTime % hourInMs)/minuteInMs);
			const secondClock = 59 - Math.floor((curTime % minuteInMs)/secondInMs);

			const addPrefixZero = (x: number) =>{
				let res = x.toString();
				if(res.length===1) res = "0"+res;
				return res;
			}

			if(countdownRef.current){
				countdownRef.current.innerText = `${addPrefixZero(hourClock)}:${addPrefixZero(minuteClock)}:${addPrefixZero(secondClock)}`
			}

		}, 1000);

		return ()=>clearInterval(countdownInterval);
		
	}, [])

	if (asset.status === "loading" || assets.status === "loading" || tradebook.status === "loading" || markPrice.status === "loading" || fundingRate.status === "loading")
		return <Loading />;

	const currentPrice = getCurrentPrice(tradebook.data);
	const priceDirection = getPriceDirection(tradebook.data);


	return (
		<div className="bg-background-2 w-full h-full flex rounded-xl px-4 items-center text-light-gray relative">
			<div
				ref={symbolRef}
				className="bg-background-3 p-2 rounded-2xl flex items-center cursor-pointer select-none"
				onClick={() => setIsDropdownActive((state) => !state)}
			>
				<img src={`./icons/${asset.data.symbol.toLocaleLowerCase()}.png`} className="w-7" alt="" />
				<p className="px-2 font-semibold">{asset.data.symbol}/USDC</p>
				{isDropdownActive ? <IoIosArrowUp size={24} /> : <IoIosArrowDown size={24} />}
				<AssetDropdown
					isDropdownActive={isDropdownActive}
					setIsDropdownActive={setIsDropdownActive}
					symbolRef={symbolRef}
					assets={assets.data}
				/>
			</div>
			<div className="ml-7">
				<div className="cursor-pointer relative group">
					<div className="text-lg" style={{ color: priceDirection === "down" ? "var(--price-red)" : "var(--price-green)" }}>
						{currentPrice.toFixed(2)}
					</div>
					<Tooltip text={"Current Price"} />
				</div>
				<div className="cursor-pointer relative group">
					<div className="text-sm">{markPrice.data.toFixed(2)}</div>
					<Tooltip text={"Mark Price"} />
				</div>
			</div>
			<div className="ml-7 text-sm">
				<div className="text-gray-400">Mark Price</div>
				<div>{markPrice.data.toFixed(2)}</div>
			</div>
			<div className="ml-7 text-sm">
				<div className="text-gray-400">Funding/Countdown</div>
				<div><span className="text-yellow-600">{(fundingRate.data*100).toFixed(4)}% / </span><span ref={countdownRef}>00:00:00</span></div>
			</div>
		</div>
	);
}

export default TopBar;
