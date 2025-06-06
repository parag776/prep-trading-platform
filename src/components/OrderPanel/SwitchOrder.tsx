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
				className={`cursor-pointer w-100 rounded-2xl py-3 text-center ${
					side === Side.BID ? "bg-green-800" : ""
				}  opacity-80`}
			>
				Buy/Long
			</div>
			<div
				onClick={() => setSide(Side.ASK)}
				className={`cursor-pointer w-100 rounded-2xl py-3 text-center ${
					side === Side.ASK ? "bg-red-800" : ""
				}  opacity-80`}
			>
				Sell/Short
			</div>
		</div>
	);
}

export default SwitchOrder;
