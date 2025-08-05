import { symbolValidation } from "../../../validations/miscValidations.js";
import { Request, Response, Router } from "express";
import { asyncHandler } from "../../utils.js";
import { getTradeHistoryFromDB } from "../../../database.js";
import  config from "../../../../../shared/config.mjs";

const router = Router();

router.get(
	"/",
	asyncHandler(async (req: Request, res: Response) => {
		const { symbol } = req.query;
		const limit = Number(req.query.limit) ?? config.trade_book_size;
		const { asset } = symbolValidation.parse({ symbol });

		const trades = await getTradeHistoryFromDB(asset.id, limit);

		res.status(200).json(trades);
	})
);

export default router;