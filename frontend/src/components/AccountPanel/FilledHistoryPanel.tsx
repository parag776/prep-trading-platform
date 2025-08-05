import { useOrderHistory } from "../../lib/hooks/orderHooks";
import Loading from "../Loading";
import type { Order } from "../../../../backend/src/generated/prisma";
import { useStore } from "../../lib/store/store";
import { useUpdateAsset } from "../../lib/hooks/assetHooks";
import { getQuantityPrecisionFromPrice } from "../../lib/utils/misc";
const infinitesimal = 1 / 1e9;

function FilledHistoryPanel() {
	const orderHistory = useOrderHistory();

	if (orderHistory.status === "loading") return <Loading />;
	return (
		<table className="w-full account-table text-center">
			<thead className="text-sm">
				<tr>
					<th className="text-start">Market</th>
					<th>Type</th>
					<th>Side</th>
					<th>Status</th>
					<th>Quantity</th>
					<th>Avg. Fill Price</th>
					<th>Value</th>
					<th>Leverage</th>
					<th>Created At</th>
				</tr>
			</thead>
			<tbody className="text-white">
				{orderHistory.data.map((order) => {
					if (order.quantity > infinitesimal) return <OpenOrderRow key={order.id} order={order} />;
				})}
			</tbody>
		</table>
	);
}

export default FilledHistoryPanel;

function OpenOrderRow({ order }: { order: Order }) {
	const getAsset = useStore((state) => state.getAsset);
	const updateAsset = useUpdateAsset();
	const quantityPrecision = getQuantityPrecisionFromPrice(order.price!);

	const getCreatedTimeString = ()=>{
		const minInMs = 1000*60;
		const hourInMs = minInMs*60;
		const dayInMs = hourInMs*60*24;
		const weekInMs = dayInMs*7;
		const monthInMs = weekInMs*4;

		const orderTime = order.createdAt.getTime();
		const TimeDiff = Date.now()-orderTime;
		if(TimeDiff<minInMs){
			return "Just now"
		} else if(TimeDiff<hourInMs){
			return `${Math.floor(TimeDiff/minInMs)} minutes ago`
		} else if(TimeDiff<dayInMs){
			return `${Math.floor(TimeDiff/hourInMs)} hours ago`
		} else if(TimeDiff<weekInMs){
			return `${Math.floor(TimeDiff/dayInMs)} days ago`
		} else if(TimeDiff<monthInMs){
			return `${Math.floor(TimeDiff/weekInMs)} weeks ago`
		} else {
			return order.createdAt.toDateString()
		}
	}

	return (
		<tr className={"border-[rgba(145,123,123,0.08)] border-t-[1px] cursor-default hover:bg-background-3"}>
			<td onClick={() => updateAsset(order.assetId)} className="cursor-pointer text-start">
				<span
					className="p-2"
					style={{
						borderLeft: order.side === "BID" ? "3px solid var(--price-green)" : "3px solid var(--price-red)",
					}}
				>
					{getAsset(order.assetId)?.symbol}/USDC
				</span>
			</td>
			<td>{order.type}</td>
			<td style={order.side === "BID" ? { color: "var(--price-green)" } : { color: "var(--price-red)" }}>
				{order.side === "ASK" ? "Short" : "Long"}
			</td>
			<td>{order.status}</td>
			<td>{order.quantity.toFixed(quantityPrecision)}</td>
			<td>{order.status==="CANCELLED"?"N/A":`$${order.average_filled_price.toFixed(2)}`}</td>
			<td>{order.status==="CANCELLED"?"N/A":`$${(order.quantity * order.average_filled_price).toFixed(2)}`}</td>
			<td className="font-bold text-gray-300">{order.leverage}x</td>
			<td>{getCreatedTimeString()}</td>
		</tr>
	);
}
