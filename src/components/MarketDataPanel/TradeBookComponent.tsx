import { Asset } from "@/generated/prisma";
import { getArrayWithKeys } from "@/lib/frontend/utils/misc";
import { TradeBook } from "@/lib/frontend/utils/tradebook";
import React, { useMemo, useState } from "react";
import Loading from "../Loading";

function TradeBookComponent({
	tradebook,
	asset,
	decimalPoints,
}: {
	tradebook: TradeBook | null;
	asset: Asset;
	decimalPoints: { quantity: number; price: number };
}) {
	const [isSizeInUsdc, setIsSizeInUsdc] = useState(false);

	function toggleIsSizeInUsdc() {
		setIsSizeInUsdc((isSizeInUsdc) => !isSizeInUsdc);
	}

	const trades = tradebook?.trades;
	if (!trades) return <Loading />;

	let tradesWithKeys = useMemo(() => {
		return getArrayWithKeys(trades);
	}, [tradebook]);

	return (
		<div className="font-sans h-full flex flex-col">
			<div className="flex text-[13px] h-[30px] items-start">
				<p className="flex w-[30%] items-center">Price {"(USDC)"}</p>
				<p
					className="flex w-[35%] items-center justify-end cursor-pointer text-gray-400 active:text-gray-300"
					onClick={toggleIsSizeInUsdc}
				>
					Qty {`(${isSizeInUsdc ? "USDC" : asset.symbol})`}
				</p>
				<p className="flex w-[35%] items-center justify-end text-gray-400">Time</p>
			</div>
			<div className=" overflow-y-auto scrollbar-hide">
				{tradesWithKeys.map((trade, index, array) => {
					// calculating price color....
					let priceColor = "#05AD6D"; //  green (default)
					if (index < array.length-1) {
						const prevTrade = array[index + 1];
						if (trade.price >= prevTrade.price)
							priceColor = "#05AD6D"; // green (increase in price)
						else priceColor = "#DD4548"; // red (decrease in price);
					}

					return (
						<div key={trade._key} className="flex items-center text-sm my-5">
							<p className="flex w-[30%] items-center" style={{ color: priceColor }}>
								{trade.price.toFixed(decimalPoints.price)}
							</p>
							<p className="flex w-[35%] items-center justify-end text-gray-200">
								{isSizeInUsdc
									? (trade.quantity * trade.price).toFixed(decimalPoints.price)
									: trade.quantity.toFixed(decimalPoints.quantity)}
							</p>
							<p className="flex w-[35%] items-center justify-end text-gray-400">
								{trade.createdAt.toISOString().substring(11, 19)}
							</p>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default TradeBookComponent;
