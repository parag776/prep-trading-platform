
import { getUserIdentity } from "../../../store/userStore.js";
import { Router, Request, Response } from "express";
import { auth } from "../../middlewares/auth.js";
import { asyncHandler } from "../../utils.js";

export const router = Router();

router.get(
	"/",
	auth,
	asyncHandler(async (req: Request, res: Response) => {
		// The `auth` middleware should attach the authenticated user's ID to req.user.id
		const userId = req.user?.id!;

		// Respond with the account metrics as JSON
		res.status(200).json(getUserIdentity(userId));
	})
);

export default router;