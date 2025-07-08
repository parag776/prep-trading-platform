import { useDecimalPrecision } from "@/lib/frontend/hooks/orderbookHooks";
import { fixDecimalPrecision } from "@/lib/frontend/utils/misc";
import React, { useRef } from "react";
import InputWithImage from "../InputWithImage";
import { Asset, Side } from "@/generated/prisma";
import PercentageSlider from "../PercentageSlider";
import ButtonOrder from "./ButtonOrder";
import { PlaceOrder } from "@/lib/common/types";
import axios from "axios";

function LimitOrderPanel({ availableEquity, price, asset, side, leverage}: { availableEquity: number; price: number; asset: Asset; side: Side; leverage: number}) {
	const decimalPrecision = useDecimalPrecision();

	const priceRef = useRef<HTMLInputElement | null>(null);
	const quantityRef = useRef<HTMLInputElement | null>(null);
	const orderValueRef = useRef<HTMLInputElement | null>(null);
	const sliderRef = useRef<HTMLInputElement | null>(null);
	const marginRequiredRef = useRef<HTMLInputElement | null>(null);

	const onPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.target.value = Math.max(0, Number(e.target.value)).toString();
		const price = Number(e.target.value);
		const quantity = Number(quantityRef.current?.value ?? 0);
		const orderValue = price * quantity;
		if (marginRequiredRef.current) {
			marginRequiredRef.current.innerHTML = fixDecimalPrecision(orderValue / leverage, 2);
		}

		if (orderValueRef.current) {
			orderValueRef.current.value = fixDecimalPrecision(orderValue, 5);
		}

		if (sliderRef.current) {
			sliderRef.current.value = String(Math.min(100, (orderValue / availableEquity / leverage) * 100));
		}
	};

	const onQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.target.value = Math.max(0, Number(e.target.value)).toString();
		const quantity = Number(e.target.value);
		const price = Number(priceRef.current?.value ?? 0);
		const orderValue = price * quantity;
		if (marginRequiredRef.current) {
			marginRequiredRef.current.innerHTML = fixDecimalPrecision(orderValue / leverage, 2);
		}

		if (orderValueRef.current) {
			orderValueRef.current.value = fixDecimalPrecision(orderValue, 5);
		}

		if (sliderRef.current) {
			sliderRef.current.value = fixDecimalPrecision(Math.min(100, (orderValue / availableEquity / leverage) * 100), 0);
		}
	};

	const onSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const percent = Number(e.target.value);
		const price = Number(priceRef.current?.value ?? 0);
		const orderValue = (percent * availableEquity * leverage) / 100;
		if (marginRequiredRef.current) {
			marginRequiredRef.current.innerHTML = fixDecimalPrecision(orderValue / leverage, 5);
		}

		if (orderValueRef.current) {
			orderValueRef.current.value = fixDecimalPrecision(orderValue, 5);
		}
		if (quantityRef.current) {
			quantityRef.current.value = fixDecimalPrecision(orderValue / price, decimalPrecision.quantity);
		}
	};

	const onOrderValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.target.value = Math.max(0, Number(e.target.value)).toString();
		const orderValue = Number(e.target.value);
		if (marginRequiredRef.current) {
			marginRequiredRef.current.innerHTML = fixDecimalPrecision(orderValue / leverage, 2);
		}
		const price = Number(priceRef.current?.value ?? 0);

		if (quantityRef.current) {
			quantityRef.current.value = fixDecimalPrecision(orderValue / price, decimalPrecision.quantity);
		}
		if (sliderRef.current) {
			sliderRef.current.value = fixDecimalPrecision(Math.min(100, (orderValue / availableEquity / leverage) * 100), 0);
		}
	};

    
    // export type PlaceOrder = {
    // 	type: Order_Type;
    // 	side: Side;
    // 	assetId: Asset["id"];
    // 	price?: number;
    // 	quantity: number;
    // 	leverage: number;
    // };

    const placeOrder = async ()=>{
        if(!(priceRef.current && quantityRef.current)) return;

        try{
            const order: PlaceOrder = {
                type: "LIMIT",
                side,
                assetId: asset.id,
                price: Number(priceRef.current.value),
                quantity: Number(quantityRef.current.value),
                leverage,
            }

            const response = (await axios.post("/api/place_order", order)).data;
        } catch(err){
            if (axios.isAxiosError(err)) {
                const msg = err.response?.data?.message;
                console.log(msg); // <- this is your `e.errors`
            } else {
                console.error("Unknown error", err);
            }
        }

    }

	return (
		<>
			<div className="my-3">
				<div className="text-[12px]">Price</div>
				<div className="text-white my-2">
					<InputWithImage img="/icons/usdc.png" defaultValue={fixDecimalPrecision(price, 1)} ref={priceRef} onInput={onPriceChange}/>
				</div>
				<div className="text-[12px]">Quantity</div>
				<div className="text-white my-2">
					<InputWithImage img={`/icons/${asset.symbol.toLowerCase()}.png`} defaultValue={0} ref={quantityRef} onInput={onQuantityChange}/>
				</div>
				<div className="my-5">
					<PercentageSlider ref={sliderRef} onInput={onSliderChange} />
				</div>
				<div className="text-[12px]">Order Value</div>
				<div className="text-white my-2">
					<InputWithImage img="/icons/usdc.png" defaultValue={0} ref={orderValueRef} onInput={onOrderValueChange}/>
				</div>
				<div className="flex justify-between text-[12px]">
					<div>margin required: </div>
					<div ref={marginRequiredRef}>0</div>
				</div>
                <div className="my-5">
				    <ButtonOrder side={side} onClick={placeOrder} />
                </div>
			</div>
		</>
	);
}

export default LimitOrderPanel;
