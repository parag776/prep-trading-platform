import { User } from "@/generated/prisma";
import { sessionWrapper } from "../sessionWrapper";
import { detailedUsersState } from "@/lib/backend/store";
import { AccountMetrics } from "@/lib/common/types";

const GET = sessionWrapper(async (req: Request, userId: User["id"]) => {
	const { usdc, orderMargin, initialMargin, maintenanceMargin, funding_unpaid } = detailedUsersState.get(userId)!;

    const accountMetrics: AccountMetrics = {usdc, orderMargin, initialMargin, maintenanceMargin, unpaidFunding: funding_unpaid};

	return new Response(JSON.stringify(accountMetrics), {
		status: 200,
		headers: {
			"content-type": "application/json",
		},
	});
});
