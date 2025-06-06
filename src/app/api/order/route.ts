import { orderManager } from "@/lib/backend/manager";
import { sessionWrapper } from "../sessionWrapper";
import { getPlaceOrderValidation } from "@/lib/backend/validations/orderValidation";

export const POST = sessionWrapper(async (req: Request, userId: string) => {
	const order = getPlaceOrderValidation(userId).parse(await req.json());
	
	orderManager(order, userId);

	return new Response("", {
		status: 200,
		headers: {
			"content-type": "application/json",
		},
	});
});
