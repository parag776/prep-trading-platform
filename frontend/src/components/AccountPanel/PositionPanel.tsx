import type { Position } from "../../../../backend/src/generated/prisma";
import { useUpdateAsset } from "../../lib/hooks/assetHooks";
import { usePositions } from "../../lib/hooks/positionHooks";
import { useMarkPrice } from "../../lib/hooks/pricesHooks";
import { useStore } from "../../lib/store/store";
import { getQuantityPrecisionFromPrice } from "../../lib/utils/misc";
import Loading from "../Loading";
import Tooltip from "../utilities/Tooltip";

const infinitesimal = 1 / 1e9;

function PositionPanel() {
	const positions = usePositions();

	if (positions.status === "loading") return <Loading />;
	return (
		<table className="w-full account-table text-center">
			<thead className="text-sm">
				<tr>
					<th className="text-start">Market</th>
					<th>Value</th>
					<th>Avg. Entry Price</th>
					<th>Mark Price</th>
					<th>PnL (ROI)</th>
					<th>Leverage</th>
					<th>Close Position</th>
				</tr>
			</thead>
			<tbody className="text-white">
				{positions.data.map((position) => {
					if (position.quantity > infinitesimal) return <PositionRow key={position.id} position={position} />;
				})}
			</tbody>
		</table>
	);
}

export default PositionPanel;

function PositionRow({ position }: { position: Position }) {
	const getAsset = useStore((state) => state.getAsset);
	const asset = getAsset(position.assetId);
	const markPriceHolder = useMarkPrice(asset!); // because by this time all the assets have been fetched.

	const updateAsset = useUpdateAsset();

	const markPrice = markPriceHolder.status === "ready" ? markPriceHolder.data : null;

	let pnlString = null;
	let pnl = 0;
	let pnlPercent = null;
	if (markPrice) {
		pnl = (markPrice - position.average_price) * position.quantity;
		if (position.side === "ASK") pnl = -pnl;
		pnlPercent = (pnl / (position.quantity * position.average_price)) * 100;
		pnlString = pnl.toFixed(2);
	}

	console.log;

	return (
		<tr className="border-[rgba(145,123,123,0.08)] border-t-[1px] cursor-default hover:bg-background-3">
			<td onClick={() => updateAsset(position.assetId)} className="cursor-pointer text-start">
				<span
					className="p-2"
					style={{
						borderLeft: position.side === "BID" ? "3px solid var(--price-green)" : "3px solid var(--price-red)",
					}}
				>
					{getAsset(position.assetId)?.symbol}/USDC
				</span>
			</td>
			<td>
				<div>${(position.quantity * position.average_price).toFixed(2)}</div>
				<div className="text-amber-600 cursor-pointer relative group">
					{position.quantity.toFixed(getQuantityPrecisionFromPrice(position.average_price))}
					<Tooltip text="Quantity" />
				</div>
			</td>
			<td>${position.average_price.toFixed(2)}</td>
			<td>${markPrice?.toFixed(2)}</td>
			<td style={pnl >= 0 ? { color: "var(--price-green)" } : { color: "var(--price-red)" }}>
				<div>{pnlString}</div>
				<div>( {pnlPercent ? Math.abs(pnlPercent).toFixed(2) : null}% )</div>
			</td>
			<td className="font-bold text-gray-300">{position.leverage}x</td>
			<td className="text-blue-600 font-semibold text-sm">
				<span className="cursor-pointer">LIMIT</span>
				<br />
				<span className="cursor-pointer">MARKET</span>
			</td>
		</tr>
	);
}
