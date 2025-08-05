import type { Side } from "../../../../backend/src/generated/prisma"

function Level({
	price,
	quantiy,
	cumulativeQuantity,
	totalQuantity,
	side,
	isSizeInUsdc,
	decimalPoints,
}: {
	price: number;
	quantiy: number;
	cumulativeQuantity: number;
	totalQuantity: number;
	side: Side;
	isSizeInUsdc: boolean;
	decimalPoints: { price: number; quantity: number };
}) {

	const priceColor = {
		ASK: "var(--color-price-red)",
		BID: "var(--color-price-green)",
	}[side];

	const cumulativeQuantityColor = {
		ASK: "var(--color-cumulative-quantity-red)",
		BID: "var(--color-cumulative-quantity-green)",
	}[side];

	const quantityColor = {
		ASK: "var(--color-quantity-red)",
		BID: "var(--color-quantity-green)",
	}[side];

	return (
		<div className="relative text-[12px] font-sans my-[2px]">
			<div className="absolute h-full w-full z-0 rounded flex justify-end">
				<div
					className="w-[20%]"
					style={{
						background: cumulativeQuantityColor,
						width: `calc(100% * (${cumulativeQuantity}/${totalQuantity}))`,
					}}
				></div>
			</div>
			<div className="absolute h-full w-full z-1 rounded flex justify-end">
				<div
					className="w-[20%]"
					style={{
						background: quantityColor,
						width: `calc(100% * (${quantiy}/${totalQuantity}))`,
					}}
				></div>
			</div>
			<div className="relative flex z-2 px-2 py-[2px]">
				<div className="flex h-full w-[30%] items-center" style={{ color: priceColor }}>
					{price.toFixed(decimalPoints.price)}
				</div>
				<div className="flex h-full w-[35%] items-center justify-end">
					{isSizeInUsdc
						? (quantiy * price).toFixed(2)
						: quantiy.toFixed(decimalPoints.quantity)}
				</div>
				<div className="flex h-full w-[35%] items-center justify-end">
					{isSizeInUsdc
						? (cumulativeQuantity * price).toFixed(2)
						: cumulativeQuantity.toFixed(decimalPoints.quantity)}
				</div>
			</div>
		</div>
	);
}


export default Level;
