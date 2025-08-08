import { useOpenOrders } from "../../lib/hooks/orderHooks";
import Loading from "../Loading";
import type { Order } from "../../../../backend/src/generated/prisma";
import { useStore } from "../../lib/store/store";
import { useUpdateAsset } from "../../lib/hooks/assetHooks";
import { getQuantityPrecisionFromPrice } from "../../lib/utils/misc";
import axios from "axios";
import { toast } from "react-toastify";


const infinitesimal = 1 / 1e9;

function OpenOrderPanel() {
	const openOrders = useOpenOrders();

	if (openOrders.status === "loading") return <Loading />;
	return (
		<table className="w-full account-table text-center">
			<thead className="text-sm">
				<tr>
					<th className="text-start">Market</th>
					<th>Side</th>
					<th>Price</th>
					<th>Quantity</th>
					<th>Value</th>
					<th>Leverage</th>
					<th>Filled</th>
					<th>Open</th>
					<th></th>
				</tr>
			</thead>
			<tbody className="text-white">
				{openOrders.data.map((order) => {
					if (order.quantity > infinitesimal) return <OpenOrderRow key={order.id} order={order} />;
				}).reverse()}
			</tbody>
		</table>
	);
}

export default OpenOrderPanel;

function OpenOrderRow({ order }: { order: Order }) {
	const getAsset = useStore((state) => state.getAsset);

    async function cancelOrder(){
        try{
            await axios.post("/api/cancel-order", {id: order.id})
            toast.success("Order cancelled successfully")
        } catch(e){
            console.log(e)
            toast.error("Something went wrong while cancelling the order.")
        }
    }

	const updateAsset = useUpdateAsset();
	const quantityPrecision = getQuantityPrecisionFromPrice(order.price!);

	return (
		<tr className="border-[rgba(145,123,123,0.08)] border-t-[1px] cursor-default hover:bg-background-3">
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
			<td style={order.side === "BID" ? { color: "var(--price-green)" } : { color: "var(--price-red)" }}>
				{order.side === "ASK" ? "Short" : "Long"}
			</td>
			<td>${order.price!.toFixed(2)}</td>
			<td>{order.quantity.toFixed(quantityPrecision)}</td>
			<td>${(order.quantity * order.price!).toFixed(2)}</td>
			<td className="font-bold text-gray-300">{order.leverage}x</td>
			<td>{order.filled_quantity.toFixed(quantityPrecision)}</td>
			<td>{(order.quantity - order.filled_quantity).toFixed(quantityPrecision)}</td>
			<td className="text-blue-600 font-semibold text-sm cursor-pointer" onClick={cancelOrder}>CANCEL</td>
		</tr>
	);
}
