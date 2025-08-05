import { getUser } from "../../../store/userStore.js";
import { Request, Response, Router } from "express";
import { asyncHandler } from "../../utils.js";
import { auth } from "../../middlewares/auth.js";

// update all positions to position with contract price.!

const router = Router();

router.get(
	"/",
	auth,
	asyncHandler(async (req: Request, res: Response) => {
		const userId = req.user?.id!;
		const positions = getUser(userId).positions;

		const positionArray = Array.from(positions.values());

		res.status(200).json(positionArray);
	})
);

export default router;
