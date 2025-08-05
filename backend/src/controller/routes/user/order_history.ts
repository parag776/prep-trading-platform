import { Router, Request, Response } from "express";
import { getOrderHistoryFromDB } from "../../../database.js";
import { asyncHandler } from "../../utils.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

router.get(
	"/",
	auth,
	asyncHandler(async (req: Request, res: Response) => {
		const userId = req.user?.id!;

		const orders = await getOrderHistoryFromDB(userId);

		res.status(200).json(orders);
	})
);

export default router;
