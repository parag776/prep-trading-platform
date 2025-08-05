import { Router, Request, Response } from "express";
import { asyncHandler } from "../../utils.js";
import { getUser } from "../../../store/userStore.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

router.get(
	"/",
	auth,
	asyncHandler(async (req: Request, res: Response) => {
		const user = getUser(req.user?.id!);
		const openOrders = user.orders;

		const ordersArray = Array.from(openOrders.values());

		res.status(200).json(ordersArray);
	})
);

export default router;
