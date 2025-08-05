import type { MouseEvent } from "react";
import { useRef, useState } from "react";
import SwitchOrder from "./SwitchOrder";
import type { Side } from "../../../../backend/src/generated/prisma";
import Switch from "../Switch";
import Loading from "../Loading";
import { useAvailableEquity } from "../../lib/hooks/accountHooks";
import { useAsset } from "../../lib/hooks/assetHooks";
import { useCurrentMarkPrice } from "../../lib/hooks/pricesHooks";
import LimitOrderPanel from "./LimitOrderPanel";
import { fixDecimalPrecision } from "../../lib/utils/misc";
import MarketOrderPanel from "./MarketOrderPanel";
import configData from "../../../../shared/config.mjs";

const choiceArray = ["Limit", "Market"];

function OrderPanel() {
	const [side, setSide] = useState<Side>("BID");
	const [choice, setChoice] = useState<string>("Limit");
	const [leverage, setLeverage] = useState(2);
	const availableEquity = useAvailableEquity();
	const asset = useAsset();

	const markPrice = useCurrentMarkPrice();

	const dialogRef = useRef<null | HTMLDialogElement>(null);
	const leverageInputRef = useRef<null | HTMLInputElement>(null);
	const leverageSliderRef = useRef<HTMLInputElement | null>(null);

	if (asset.status === "loading" || markPrice.status === "loading") {
		return (
			<div className="bg-background-2 w-full h-full flex flex-col rounded-xl">
				<Loading />
			</div>
		);
	}

	function onOpen() {
		if (dialogRef.current) {
			dialogRef.current.showModal();
		}
		return {};
	}

	function closeDialog(leverage: number) {
		if (dialogRef.current) {
			updateLeverage(leverage);
			dialogRef.current.close();
		}
	}

	function close(e: MouseEvent<HTMLElement>) {
		if (dialogRef.current) {
			const dialogDimensions = dialogRef.current.getBoundingClientRect();

			if (
				dialogDimensions.width &&
				(e.clientX < dialogDimensions.left ||
					e.clientX > dialogDimensions.right ||
					e.clientY > dialogDimensions.bottom ||
					e.clientY < dialogDimensions.top)
			) {
				closeDialog(leverage);
			}
		}
	}

	function cancelLeverage() {
		closeDialog(leverage);
	}

	function confirmLeverage() {
		if (leverageInputRef.current) {
			closeDialog(Number(leverageInputRef.current.value));
			setLeverage(Number(leverageInputRef.current.value));
		}
	}


	// if (initialMarkPriceRef.current === null) {
	// }

	const updateLeverage = (value: number) => {
		// Clamp within bounds
		const clamped = Math.max(configData.leverage_min, Math.min(configData.leverage_max, value));

		if (leverageInputRef.current) {
			leverageInputRef.current.value = clamped.toString();
		}
		if (leverageSliderRef.current) {
			leverageSliderRef.current.value = clamped.toString();
		}
	};

	const incrementLeverage = () => {
		if (!leverageInputRef.current) return;
		const current = Number(leverageInputRef.current.value);
		updateLeverage(current + 1);
	};

	const decrementLeverage = () => {
		if (!leverageInputRef.current) return;
		const current = Number(leverageInputRef.current.value);
		updateLeverage(current - 1);
	};

	const equity = availableEquity.status === "ready" ? availableEquity.data : 0;


	return (
		<div className="bg-background-2 w-full h-full flex flex-col rounded-xl py-6 px-4 text-gray-400">
			<SwitchOrder side={side} setSide={setSide} />
			<div className="my-5 flex justify-between">
				<Switch choiceArray={choiceArray} choice={choice} setChoice={setChoice} />
				<div className="bg-background-3 px-2 rounded-sm relative">
					<div onClick={onOpen} className="relative top-0.5 cursor-pointer">
						{leverage}x
					</div>
					<dialog
						ref={dialogRef}
						onClick={close}
						className={`text-gray-400 w-sm text-center p-6 px-10 rounded-lg bg-background-1 shadow-md max-w-md top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
					>
						<div className="text-slate-300 my-2 text-2xl">Set Leverage</div>
						<div className="flex justify-between my-2">
							<div>Leverage</div>
							<div>
								Max: <span className="text-slate-300 ">{configData.leverage_max}</span>
							</div>
						</div>
						<div
							className="flex justify-between p-2 focus-within:outline-blue-600 focus-within:outline-2 rounded-md outline-gray-700 outline-2 m-auto my-4"
							tabIndex={0}
						>
							<button className="text-2xl cursor-pointer select-none" onClick={decrementLeverage}>
								-
							</button>
							<input
								ref={leverageInputRef}
								type="number"
								className="outline-none text-slate-300 text-center"
								min={configData.leverage_min}
								max={configData.leverage_max}
								defaultValue={leverage}
								onInput={(e) => updateLeverage(Number(e.currentTarget.value))}
							/>
							<button className="text-2xl cursor-pointer select-none" onClick={incrementLeverage}>
								+
							</button>
						</div>
						<div className="mx-auto my-4">
							<input
								type="range"
								ref={leverageSliderRef}
								min={configData.leverage_min}
								max={configData.leverage_max}
								className="w-full"
								onInput={(e) => updateLeverage(Number(e.currentTarget.value))}
							/>
							<div className="flex justify-between text-sm text-slate-400 mt-1">
								<span>{configData.leverage_min}x</span>
								<span>{configData.leverage_max}x</span>
							</div>
						</div>
						<div className="flex justify-around mt-4">
							<button
								onClick={cancelLeverage}
								className="bg-background-3 text-white px-9 py-3 rounded-xl font-semibold cursor-pointer border-white border"
							>
								Cancel
							</button>
							<button
								onClick={confirmLeverage}
								className="bg-white text-black px-9 py-2 rounded-xl font-semibold cursor-pointer border-black border"
							>
								Confirm
							</button>
						</div>
					</dialog>
				</div>
			</div>
			<div className="flex justify-between text-[13px]">
				<div className="">Available Equity</div>
				<div className="text-white">{fixDecimalPrecision(equity, 2)} USDC</div>
			</div>
			{choice === "Limit" ? (
				<LimitOrderPanel key={asset.data.id} asset={asset.data} availableEquity={equity} side={side} leverage={leverage} />
			) : (
				<MarketOrderPanel asset={asset.data} availableEquity={equity} price={markPrice.data} side={side} leverage={leverage} />
			)}
		</div>
	);
}

export default OrderPanel;
