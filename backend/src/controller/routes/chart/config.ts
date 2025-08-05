import { resolutionInfo } from "../../../../../shared/data.mjs";
import { asyncHandler } from "../../utils.js";
import { Request, Response, Router } from "express";

const router = Router();

router.get(
	"/",
	asyncHandler(async (req: Request, res: Response) => {
		const resolutionSymbols = Array.from(resolutionInfo.values()).map(({ symbol }) => symbol);

		const config = {
			supported_resolutions: resolutionSymbols,
			supports_group_request: false,
			supports_marks: false,
			supports_search: true,
			supports_timescale_marks: false,
		};

		res.status(200).json(config);
	})
);

export default router;
