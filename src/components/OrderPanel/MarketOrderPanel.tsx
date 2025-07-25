import { Asset, Side } from "@/generated/prisma";
import { useDecimalPrecision } from "@/lib/frontend/hooks/orderbookHooks";
import { fixDecimalPrecision } from "@/lib/frontend/utils/misc";
import { useRef, useState } from "react";
import InputWithImage from "../InputWithImage";
import PercentageSlider from "../PercentageSlider";
import ButtonOrder from "./ButtonOrder";

export default function MarketOrderPanel({ availableEquity, price, asset, side, leverage}: { availableEquity: number; price: number; asset: Asset; side: Side; leverage: number}) {
	const decimalPrecision = useDecimalPrecision();

	const quantityRef = useRef<HTMLInputElement | null>(null);
	const orderValueRef = useRef<HTMLSpanElement | null>(null);
	const sliderRef = useRef<HTMLInputElement | null>(null);
	const marginRequiredRef = useRef<HTMLInputElement | null>(null);

	const onQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const quantity = Number(e.target.value);
		const orderValue = price * quantity;
		if (marginRequiredRef.current) {
			marginRequiredRef.current.innerHTML = fixDecimalPrecision(orderValue / leverage, 2);
		}

		if (orderValueRef.current) {
			orderValueRef.current.innerHTML = fixDecimalPrecision(orderValue, 2);
		}

		if (sliderRef.current) {
			sliderRef.current.value = fixDecimalPrecision(Math.min(100, (orderValue / availableEquity / leverage) * 100), 0);
		}
	};

	const onSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const percent = Number(e.target.value);
		const orderValue = (percent * availableEquity * leverage) / 100;
		if (marginRequiredRef.current) {
			marginRequiredRef.current.innerHTML = fixDecimalPrecision(orderValue / leverage, 5);
		}

		if (orderValueRef.current) {
			orderValueRef.current.innerHTML = fixDecimalPrecision(orderValue, 2);
		}
		if (quantityRef.current) {
			quantityRef.current.value = fixDecimalPrecision(orderValue / price, decimalPrecision.quantity);
		}
	};

	return (
		<>
            <div className="flex justify-between text-[12px] mt-4">
                <div className="cursor-pointer">Quantity</div>
                <div>
                    <span className="relative top-[3px]">&asymp; </span><span ref={orderValueRef}>0</span> <span>USDC</span>
                </div>
            </div>
            <div className="text-white my-2 ">
                <InputWithImage img={`/icons/${asset.symbol.toLowerCase()}.png`} defaultValue={0} ref={quantityRef} onInput={onQuantityChange}/>
            </div>
            <div className="my-5">
                <PercentageSlider ref={sliderRef}  onInput={onSliderChange}/>
            </div>
            <div className="flex justify-between text-[12px]">
                <div>margin required: </div>
                <div ref={marginRequiredRef}>0</div>
            </div>
            <div className="my-5">
                <ButtonOrder side={side} onClick={() => {}} />
            </div>
		</>
	);
}
