import { Side } from "@/generated/prisma";
import React from "react";

function SwitchOrder({
	side,
	setSide,
}: {
	side: Side;
	setSide: React.Dispatch<React.SetStateAction<Side>>;
}) {
	return (
		<div className="flex rounded-2xl bg-background-3">
			<div
				onClick={() => setSide(Side.BID)}
				style={side===Side.BID?{color: "var(--price-green)", background: "var(--color-background-green)"}:{}}
				className={`cursor-pointer w-100 rounded-2xl py-3 text-center opacity-80`}
			>
				Buy/Long
			</div>
			<div
				onClick={() => setSide(Side.ASK)}
				style={side===Side.ASK?{color: "var(--price-red)", background: "var(--color-background-red)"}:{}}
				className={`cursor-pointer w-100 rounded-2xl py-3 text-center opacity-80`}
			>
				Sell/Short
			</div>
		</div>
	);
}

export default SwitchOrder;
