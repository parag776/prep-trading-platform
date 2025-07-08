import { Position, User } from "@/generated/prisma";
import { requestWrapper } from "../requestWrapper";
import { getUser } from "@/lib/backend/store/userStore";

// update all positions to position with contract price.!

// @ts-ignore
// ignoring ts here. no need for ts here.
export const GET = requestWrapper((req: Request, userId: User["id"]) => {
	console.log(getUser(userId))
	const positions = getUser(userId).positions;

	const positionArray = Array.from(positions.values());

	return new Response(JSON.stringify(positionArray), {
		status: 200,
		headers: {
			"content-type": "application/json",
		},
	});
});
