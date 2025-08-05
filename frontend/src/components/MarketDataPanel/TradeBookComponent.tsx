import { useMemo, useState } from "react";
import { getArrayWithKeys } from "../../lib/utils/misc";
import { useTradebook } from "../../lib/hooks/tradebookHooks";
import { useAsset } from "../../lib/hooks/assetHooks";
import { useDecimalPrecision } from "../../lib/hooks/orderbookHooks";
import Loading from "../Loading";

function TradeBookComponent() {
	const tradebook = useTradebook();
	const asset = useAsset();
	const decimalPoints = useDecimalPrecision();

	const [isSizeInUsdc, setIsSizeInUsdc] = useState(false);
	if (tradebook.status === "loading" || asset.status === "loading") return <Loading />;

	function toggleIsSizeInUsdc() {
		setIsSizeInUsdc((isSizeInUsdc) => !isSizeInUsdc);
	}

	const trades = tradebook.data.trades;
	if (!trades) return <Loading />;

	let tradesWithKeys = useMemo(() => {
		return getArrayWithKeys(trades);
	}, [tradebook.data]);

	return (
		<div className="font-sans h-full flex flex-col">
			<div className="flex text-[13px] h-[30px] items-start">
				<p className="flex w-[30%] items-center">Price {"(USDC)"}</p>
				<p className="flex w-[35%] items-center justify-end cursor-pointer text-gray-400 active:text-gray-300" onClick={toggleIsSizeInUsdc}>
					Qty {`(${isSizeInUsdc ? "USDC" : asset.data.symbol})`}
				</p>
				<p className="flex w-[35%] items-center justify-end text-gray-400">Time</p>
			</div>
			<div className=" overflow-y-auto scrollbar-hide">
				{tradesWithKeys.map((trade, index, array) => {
					// calculating price color....
					let priceColor = "#05AD6D"; //  green (default)
					if (index < array.length - 1) {
						const prevTrade = array[index + 1];
						if (trade.price >= prevTrade.price) priceColor = "#05AD6D"; // green (increase in price)
						else priceColor = "#DD4548"; // red (decrease in price);
					}

					return (
						<div key={trade._key} className="flex items-center text-sm my-5">
							<p className="flex w-[30%] items-center" style={{ color: priceColor }}>
								{trade.price.toFixed(decimalPoints.price)}
							</p>
							<p className="flex w-[35%] items-center justify-end text-gray-200">
								{isSizeInUsdc ? (trade.quantity * trade.price).toFixed(decimalPoints.price) : trade.quantity.toFixed(decimalPoints.quantity)}
							</p>
							<p className="flex w-[35%] items-center justify-end text-gray-400">{trade.createdAt.toISOString().substring(11, 19)}</p>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default TradeBookComponent;
