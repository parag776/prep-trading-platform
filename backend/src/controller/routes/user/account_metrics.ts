import { AccountMetrics } from "../../../../../shared/types.mjs";
import { getUser } from "../../../store/userStore.js";
import { Router, Request, Response, NextFunction } from "express";
import { auth } from "../../middlewares/auth.js";
import { asyncHandler } from "../../utils.js";

export const router = Router();

router.get(
	"/",
	auth,
	asyncHandler(async (req: Request, res: Response) => {
		// The `auth` middleware should attach the authenticated user's ID to req.user.id
		const userId = (req as any).user?.id;
		if (!userId) {
			// If userId is not present, return an error with explanation
			res.status(401).json({
				message: "Unauthorized: No user ID found in request. This usually means authentication failed or the auth middleware did not attach the user information properly.",
			});
			return;
		}

		// Retrieve user data from the store
		const { usdc, orderMargin, initialMargin, maintenanceMargin, funding_unpaid } = getUser(userId);

		// Construct the AccountMetrics object
		const accountMetrics: AccountMetrics = {
			usdc,
			orderMargin,
			initialMargin,
			maintenanceMargin,
			unpaidFunding: funding_unpaid,
		};

		// Respond with the account metrics as JSON
		res.status(200).json(accountMetrics);
	})
);

export default router;