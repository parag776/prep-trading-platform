import { Side } from "@/generated/prisma";
import React from "react";


function ButtonOrder({ onClick, side }: { onClick: () => void; side: Side }) {
	const backgroundColor = side === Side.BID ? "var(--price-green)" : "var(--price-red)";
	return (
		<button
			onClick={onClick}
			style={{
				backgroundColor,
				color: "var(--color-background-1)",
			}}
			className="active:opacity-80 hover:opacity-90 font-bold cursor-pointer w-full rounded-2xl py-3 text-center"
		>
			{side === Side.BID ? "Buy/Long" : "Sell/Short"}
		</button>
	);
}

export default ButtonOrder;
