import { depositInDB } from "../../database.js";
import { depositValidation } from "../../validations/miscValidations.js";
import { deposit, getUser } from "../../store/userStore.js";
import { Request, Response, Router } from "express";
import { auth } from "../middlewares/auth.js";
import { asyncHandler } from "../utils.js";

const router = Router();

router.post("/", auth, asyncHandler(async (req: Request, res: Response) => {
	let { amount } = depositValidation.parse(req.body);
	const curUser = getUser(req.user?.id!);

	if (amount + curUser.usdc < 0) {
		amount = -curUser.usdc;
	}

	deposit(curUser, amount);
	depositInDB(req.user?.id!, amount);
	res.status(200).send();
}));

export default router;
