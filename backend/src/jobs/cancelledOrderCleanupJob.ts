import configData from "../../../shared/config.mjs";
import prisma from "../database.js";
import { getAllUsers, getDetailedUsersState } from "../store/userStore.js";

export function initializeOrderCancellationJob() {
	const maxOrders = configData.order_history_size;
	setInterval(async () => {
		for (const [userId, user] of getAllUsers()) {

			const ordersToKeep = (
				await prisma.order.findMany({
					where: {
						userId,
						status: "CANCELLED",
					},
					orderBy: {
						updatedAt: "desc",
					},
					take: maxOrders,
					select: {
						id: true,
					},
				})
			).map((order) => order.id);

			await prisma.order.deleteMany({
				where: {
					userId,
					status: "CANCELLED",
					id: {
						notIn: ordersToKeep,
					},
				},
			});
		}
	}, 60 * 60 * 1000); // every hour
}
