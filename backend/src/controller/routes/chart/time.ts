import { Router, Request, Response } from "express";
import { asyncHandler } from "../../utils.js";

import { getSecondsFromDate } from "../../../utils.js";

const router = Router();

router.get(
	"/",
	asyncHandler(async (req: Request, res: Response) => {
		const serverTime = getSecondsFromDate(new Date(Date.now()));
		res.status(200).json(serverTime);
	})
);

export default router;
