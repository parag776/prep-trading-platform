import { User } from "@/generated/prisma";
import prisma from "@/lib/backend/database";
import jwt, { JwtPayload } from "jsonwebtoken";

export const socketSessionWrapper = async (
	cb: (
		client: import("ws").WebSocket,
		server: import("ws").WebSocketServer,
		userId: User["id"] | null
	) => void
) => {
	return async (
		client: import("ws").WebSocket,
		_request: import("node:http").IncomingMessage,
		server: import("ws").WebSocketServer
	) => {
		try {
			function getToken() {
				try {
					const token = _request.headers.authorization;
					if (token) return token;

					const cookies = _request.headers.cookie
						?.split("; ")
						.map((val) => val.split("="));
					for (let cookie of cookies!) {
						if (
							cookie[0] === "next-auth.session-token" ||
							cookie[0] === "__Secure-next-auth.session-token"
						) {
							return cookie[1];
						}
					}
					return null;
				} catch (e) {
					return null;
				}
			}

			function validateSession() {
				const token = getToken();
				if (!token) {
					return null;
				}
				const payload = jwt.verify(
					token,
					process.env.NEXTAUTH_SECRET!
				) as JwtPayload;
				return payload;
			}

			const payload = validateSession();
			if (!payload) {
                cb(client, server, null);
				return;
			}

			const userId = (
				await prisma.user.findUnique({
					select: {
						id: true,
					},
					where: {
						email: payload.email,
					},
				})
			)?.id;

			if (!userId) {
                cb(client, server, null);
				return;
			}
            cb(client, server, userId);

		} catch (e) {
            cb(client, server, null);
			return;
		}
	};
};
