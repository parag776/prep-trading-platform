"use client";
import { MouseEvent } from "react";

function Button({ onClick, color, text }: { onClick: (e: MouseEvent<HTMLElement>) => {}; color: string; text: string }) {
	const bgColorClass = {
		red: "bg-background-red",
		blue: "bg-background-blue",
		green: "bg-background-green",
        white: "bg-white"
	}[color];

	const textColorClass = {
		red: "text-text-red",
		blue: "text-text-blue",
		green: "text-text-green",
        white: "text-black"
	}[color];

	return (
		<div className={`py-2 px-4 rounded-md  ${bgColorClass} cursor-pointer`} onClick={onClick}>
			<p className={`${textColorClass}`}>{text}</p>
		</div>
	);
}

export default Button;
