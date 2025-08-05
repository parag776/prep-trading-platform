import { symbolValidation } from "../../../validations/miscValidations.js";
import { getOrderbookLite } from "../../../store/orderbookStore.js";
import { Request, Response, Router } from "express";
import { asyncHandler } from "../../utils.js";

const router = Router();

router.get(
	"/",
	asyncHandler(async (req: Request, res: Response) => {
		const { symbol } = req.query;
		const { asset } = symbolValidation.parse({ symbol });

		const orderbook = getOrderbookLite(asset.id);

		res.status(200).json(orderbook);
	})
);

export default router;
