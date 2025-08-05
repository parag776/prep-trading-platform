import { auth } from "../../middlewares/auth.js";
import { asyncHandler } from "../../utils.js";
import { Request, Response, Router } from "express";
import { getUser } from "../../../store/userStore.js";
const router = Router();

router.get(
	"/",
    auth,
	asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id!;
		const userBalance = getUser(userId).usdc;
		res.status(200).json(userBalance);
	})
);

export default router;
