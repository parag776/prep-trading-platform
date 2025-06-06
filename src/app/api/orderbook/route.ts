import { getOrderbookLite } from "@/lib/backend/utils";
import { symbolValidation } from "@/lib/backend/validations/miscValidations";
import { requestWrapper } from "../requestWrapper";

export const GET = requestWrapper(async (req: Request) => {
	const { searchParams } = new URL(req.url);
	const params = {
		symbol: searchParams.get("symbol"),
	};

	console.log(params); // testing here.
	const { assetId } = symbolValidation.parse(params);

	const orderbook = getOrderbookLite(assetId);

	return new Response(JSON.stringify(orderbook), {
		status: 200,
		headers: {
			"content-type": "application/json",
		},
	});
});
