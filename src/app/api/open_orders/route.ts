import { User } from "@/generated/prisma";
import { sessionWrapper } from "../sessionWrapper";
import { OrderWithRequiredPrice } from "@/lib/common/types";
import { getUser } from "@/lib/backend/store/userStore";
export const GET = sessionWrapper(async (req: Request, userId: User["id"]) => {
	const user = getUser(userId);
	const openOrders = user.orders

	const ordersArray = Array.from(openOrders.values()).map((order) => {
		return order;
	});

	return new Response(JSON.stringify(ordersArray), {
		status: 200,
		headers: {
			"content-type": "application/json",
		},
	});
});
