import { symbolValidation } from "../../../validations/miscValidations.js";
import { getMarkPrice } from "../../../store/priceStore.js";
import { Request, Response, Router } from "express";
import { asyncHandler } from "../../utils.js";

const router = Router();

router.get(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
        const { symbol } = req.query;
        const { asset } = symbolValidation.parse({ symbol });
        const markPrice = getMarkPrice(asset.id);
        res.status(200).json(markPrice);
    })
);

export default router;