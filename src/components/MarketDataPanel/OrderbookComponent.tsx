import React, { useContext, useEffect, useRef, useState } from "react";
import Loading from "../Loading";
import Orders from "./Orders";
import { Asset, Side } from "@/generated/prisma";
import { OrderBookLite, TradeLite } from "@/lib/common/types";
import { TradeBook } from "@/lib/frontend/utils/tradebook";
import Tooltip from "../utilities/Tooltip";
import BidAskRatioBar from "./BidAskRatioBar";

function OrderbookComponent({
	orderbook,
	asset,
	tradebook,
    decimalPoints,
    priceColor,

}: {
	orderbook: OrderBookLite;
	asset: Asset;
	tradebook: TradeBook;
    decimalPoints: {quantity: number, price: number}
    priceColor: string
}) {
	const [isSizeInUsdc, setIsSizeInUsdc] = useState(false);

	if (!orderbook) return <Loading />;
	if (!tradebook) return <Loading />;

    const trades = tradebook.trades

	// get latest price
	let price = (0).toFixed(decimalPoints.price);
	if (trades.length > 0) {
		price = trades[0].price.toFixed(decimalPoints.price);
	}

	function toggleIsSizeInUsdc() {
		setIsSizeInUsdc((isSizeInUsdc) => !isSizeInUsdc);
	}

    const ordersRef = useRef<HTMLDivElement | null>(null);
    const priceDivRef = useRef<HTMLDivElement | null>(null)

    function recenter(behavior: ScrollBehavior = "smooth"){
        const div = ordersRef.current
        const priceDiv = priceDivRef.current;
        if(div && priceDiv){

            const priceDivHeight = priceDiv.clientHeight
            const bidTop = div.children[2].getBoundingClientRect().top

            const parentTop = div.getBoundingClientRect().top;
            const relativeY = bidTop - parentTop;

            const currentScroll = relativeY-priceDivHeight/2
            const requiredScroll = div.clientHeight/2;

            div.scrollTo({
                top: div.scrollTop+currentScroll - requiredScroll,
                behavior
            })
        }
    }

    useEffect(()=>{
        recenter("instant")
    }, [orderbook])

	return (
		<div className="h-full">
			<div className="flex text-[13px] font-sans h-[30px] items-start">
				<p className="flex w-[30%] items-center">Price {"(USDC)"}</p>
				<p
					className="flex w-[35%] items-center justify-end cursor-pointer text-gray-400 active:text-gray-300"
					onClick={toggleIsSizeInUsdc}
				>
					Size {`(${isSizeInUsdc ? "USDC" : asset.symbol})`}
				</p>
				<p
					className="flex w-[35%] items-center justify-end cursor-pointer text-gray-400 active:text-gray-300"
					onClick={toggleIsSizeInUsdc}
				>
					Total {`(${isSizeInUsdc ? "USDC" : asset.symbol})`}
				</p>
			</div>
			<div ref={ordersRef} className="h-[calc(100%-50px)] flex flex-col overflow-y-auto scrollbar-hide relative transition-all">
				<div className="flex-1 flex flex-col justify-end">
					<Orders
						orders={orderbook.askOrderbook.orders}
						side={Side.ASK}
						isSizeInUsdc={isSizeInUsdc}
						decimalPoints={decimalPoints}
					/>
				</div>
				<div ref={priceDivRef} className="flex justify-between items-center sticky top-0 bottom-0 z-6 bg-background-2">
					<div
						className="p-2 cursor-pointer relative group "
						style={{ color: priceColor }}
					>
						<div>{price}</div>
						<Tooltip text={"Market Price"} />
					</div>
                    <div onClick={()=>recenter()} className="text-blue-700 text-sm cursor-pointer active:text-blue-900">
                        recenter
                    </div>
				</div>
				<div className="flex-1">
					<Orders
						orders={orderbook.bidOrderbook.orders}
						side={Side.BID}
						isSizeInUsdc={isSizeInUsdc}
						decimalPoints={decimalPoints}
					/>
				</div>
			</div>
            <div className="h-[20px]">
                <BidAskRatioBar orderbook={orderbook}/>
            </div>
		</div>
	);
}

export default OrderbookComponent;
