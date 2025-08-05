import { executeOrderCancellation } from "../../exchangeController.js";
import { getCancelOrderValidation } from "../../validations/orderValidation.js";
import { Request, Response, Router } from "express";
import { auth } from "../middlewares/auth.js";
import { asyncHandler } from "../utils.js";

const router = Router();

router.post(
	"/",
	auth,
	asyncHandler(async (req: Request, res: Response) => {
		const {id: orderId} = getCancelOrderValidation(req.user?.id!).parse(req.body);
        console.log("reached here.")
		await executeOrderCancellation(req.user?.id!, orderId);
		res.status(200).json({ message: "success" });
	})
);

export default router;
