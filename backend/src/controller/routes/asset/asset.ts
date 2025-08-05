import { symbolValidation } from "../../../validations/miscValidations.js";    
import { asyncHandler } from "../../utils.js";
import { Request, Response, Router } from "express";

export const router = Router();

router.get("/", asyncHandler(async (req: Request, res: Response)=>{
    const { symbol } = req.query;
    const { asset } = symbolValidation.parse({ symbol });
    res.status(200).json(asset);
}))

export default router;