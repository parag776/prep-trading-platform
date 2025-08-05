import { Router, Request, Response } from "express";
import { asyncHandler } from "../../utils.js";
import { symbolValidation } from "../../../validations/miscValidations.js";
import { getContractPrice } from "../../../store/candleStore.js";

const router = Router();

router.get(
	"/",
	asyncHandler(async (req: Request, res: Response) => {
		const { symbol } = req.query;
		const { asset } = symbolValidation.parse({ symbol });
		const contractPrice = getContractPrice(asset.id);
		res.json(contractPrice);
	})
);

export default router;
