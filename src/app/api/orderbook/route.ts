import { symbolValidation } from "@/lib/backend/validations/miscValidations";
import { requestWrapper } from "../requestWrapper";
import { getOrderbookLite } from "@/lib/backend/store/orderbookStore";

export const GET = requestWrapper(async (req: Request) => {
	const { searchParams } = new URL(req.url);
	const params = {
		symbol: searchParams.get("symbol"),
	};

	const { asset } = symbolValidation.parse(params);

	const orderbook = getOrderbookLite(asset.id);

	return new Response(JSON.stringify(orderbook), {
		status: 200,
		headers: {
			"content-type": "application/json",
		},
	});
});
