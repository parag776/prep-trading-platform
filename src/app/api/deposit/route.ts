import { User } from "@/generated/prisma";
import { sessionWrapper } from "../sessionWrapper";
import prisma, { depositInDB } from "@/lib/backend/database";
import { depositValidation } from "@/lib/backend/validations/miscValidations";
import {  adjustUsdc, deposit, getUser } from "@/lib/backend/store/userStore";

export const POST = sessionWrapper(async (req: Request, userId: User["id"]) => {
	const body = await req.json();

	let { amount } = depositValidation.parse(body);
	const curUser = getUser(userId);

	if (amount + curUser.usdc < 0) {
		amount = -curUser.usdc;
	}

	deposit(curUser, amount);
	depositInDB(userId, amount);
	return new Response("", {
		status: 200,
	});
});
