import { User } from "@/generated/prisma";
import { sessionWrapper } from "../sessionWrapper";
import { getOrderbookLite } from "@/lib/backend/utils";
import { orderbookValidation } from "@/lib/backend/validations/miscValidations";

export const GET = sessionWrapper(async (req: Request, userId: User["id"]) => {
	const { assetId } = orderbookValidation.parse(await req.json());

	const orderbook = getOrderbookLite(assetId);

	return new Response(JSON.stringify(orderbook), {
		status: 200,
		headers: {
			"content-type": "application/json",
		},
	});
});
