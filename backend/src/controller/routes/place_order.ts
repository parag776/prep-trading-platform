import { placeOrder } from "../../exchangeController.js";
import { getPlaceOrderValidation } from "../../validations/orderValidation.js";
import { Request, Response, Router } from "express";
import { auth } from "../middlewares/auth.js";
import { asyncHandler } from "../utils.js";

const router = Router();

router.post(
	"/",
	auth,
	asyncHandler(async (req: Request, res: Response) => {
		const order = getPlaceOrderValidation(req.user?.id!).parse(req.body);

		await placeOrder(order, req.user?.id!);

		res.status(200).json({ message: "success" });
	})
);

export default router;
