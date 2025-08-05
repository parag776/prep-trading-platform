
import type { OrderBookLite } from "../../../../shared/types.mjs"

function BidAskRatioBar({ orderbook }: { orderbook: OrderBookLite }) {
	const totalAskQuantity = orderbook.askOrderbook.orders.at(-1)?.cumulativeQuantity ?? 0;
	const totalBidQuantity = orderbook.bidOrderbook.orders.at(-1)?.cumulativeQuantity ?? 0;
	const total = totalAskQuantity + totalBidQuantity;


    const isNoQuantity = totalAskQuantity === 0 && totalBidQuantity === 0;
    
	const bidPercent = isNoQuantity? 0 : Math.round((totalBidQuantity / total) * 100);
    const askPercent = isNoQuantity? 0 : 100-bidPercent



	return (
		<div className="h-full flex w-full overflow-hidden mt-1 justify-between">
			<div
				className="relative"
				style={{
					width: `${isNoQuantity? 50: bidPercent*0.6 + 20}%`,
				}}
			>
				<div className="z-2  h-full w-full absolute pl-3 text-sm" style={{color: `${isNoQuantity? "var(--light-gray)":"var(--color-price-green)"}`}}>{bidPercent}%</div>
				<div
					className="z-1 skew-x-[25deg] b-gray-600 border-r-2 absolute h-full w-[105%] left-[-5%]"
					style={{
						background: `${isNoQuantity?"var(--color-background-1)":"var(--color-cumulative-quantity-green)"}`,
					}}
				></div>
			</div><div
				className="relative"
				style={{
					width: `${isNoQuantity? 50: askPercent*0.6 + 20}%`,
				}}
			>
				<div className="z-2  h-full w-full absolute pr-3 text-end  text-sm" style={{color: `${isNoQuantity? "var(--light-gray)":"var(--color-price-red)"}`}}>{askPercent}%</div>
			<div
				className="skew-x-[25deg] flex-1 b-gray-600 border-l-2 z-1 absolute  h-full w-[105%] right-[-5%]"
				style={{
					background: `${isNoQuantity?"var(--color-background-1)":"var(--color-cumulative-quantity-red)"}`,
				}}
			></div>

            </div>
		</div>
	);
}

export default BidAskRatioBar;
