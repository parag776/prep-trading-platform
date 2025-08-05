import type { MouseEvent } from "react";
import { useRef } from "react";
import Button from "./Button";

function TransactionButton({ type, callback }: { type: "deposit" | "withdraw"; callback: (amount: number) => void }) {
	const inputRef = useRef<null | HTMLInputElement>(null);
	const dialogRef = useRef<null | HTMLDialogElement>(null);

	function onSubmit() {
		if (inputRef.current) {
			callback(Number(inputRef.current.value));
		}
		if (dialogRef.current) {
			dialogRef.current.close();
		}
		return {};
	}

	function onOpen() {
		if (dialogRef.current) {
			dialogRef.current.showModal();
		}
		return {};
	}

	function close(e: MouseEvent<HTMLElement>) {
		if (dialogRef.current) {
			const dialogDimensions = dialogRef.current.getBoundingClientRect();

			if (e.clientX < dialogDimensions.left || e.clientX > dialogDimensions.right || e.clientY > dialogDimensions.bottom || e.clientY < dialogDimensions.top) {
				dialogRef.current.close();
			}
		}
	}

	const shadowBackgroundClass = {
		red: "shadow-background-red",
		blue: "shadow-background-blue",
		green: "shadow-background-green",
		white: "shadow-background-white",
	}[type === "deposit" ? "green" : "blue"];

	return (
		<div className="rounded-lg">
			<Button onClick={onOpen} color={type === "deposit" ? "green" : "blue"} text={capitalizeFirstLetter(type)} />
			<dialog
				ref={dialogRef}
				onClick={close}
				className={`text-slate-300 text-center p-6 rounded-lg bg-background-1 shadow-md ${shadowBackgroundClass} max-w-md top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full`}
			>
				<label htmlFor="amount" className="block">{capitalizeFirstLetter(type)} Amount (USDC)</label>
				<input className="text-center my-5 outline-none" ref={inputRef} type="number" id="amount" name="amount" min="1" defaultValue="1000" placeholder="Amount" required></input>
				<div className="text-center w-1/2 mx-auto">

					<Button onClick={onSubmit} color={type === "deposit" ? "green" : "blue"} text={capitalizeFirstLetter(type)}></Button>
				</div>
			</dialog>
		</div>
	);
}

function capitalizeFirstLetter(text: string) {
	return text.charAt(0).toUpperCase() + text.slice(1);
}

export default TransactionButton;
