import { getAllAssets } from "../../../store/assetStore.js";
import { asyncHandler } from "../../utils.js";
import { Request, Response, Router } from "express";

const router = Router();

router.get("/", asyncHandler(async (req: Request, res: Response)=>{
    res.status(200).json(getAllAssets());
}));

export default router;