import { sessionWrapper } from "../sessionWrapper";
import { getPlaceOrderValidation } from "@/lib/backend/validations/orderValidation";

export const POST = sessionWrapper(async (req: Request, userId: string) => {
	const order = getPlaceOrderValidation(userId).parse(await req.json());

	return new Response(JSON.stringify(order), {
		status: 200,
		headers: {
			"content-type": "application/json",
		},
	});
});
