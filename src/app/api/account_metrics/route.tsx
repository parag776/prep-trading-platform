import { User } from "@/generated/prisma";
import { sessionWrapper } from "../sessionWrapper";
import { AccountMetrics } from "@/lib/common/types";
import { getUser } from "@/lib/backend/store/userStore";

export const GET = sessionWrapper(async (req: Request, userId: User["id"]) => {
	const { usdc, orderMargin, initialMargin, maintenanceMargin, funding_unpaid } = getUser(userId);

	const accountMetrics: AccountMetrics = { usdc, orderMargin, initialMargin, maintenanceMargin, unpaidFunding: funding_unpaid };

	return new Response(JSON.stringify(accountMetrics), {
		status: 200,
		headers: {
			"content-type": "application/json",
		},
	});
});
