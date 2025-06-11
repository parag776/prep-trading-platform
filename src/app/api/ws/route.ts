import { requestWrapper } from "../requestWrapper";
import { WebSocket, WebSocketServer } from "ws";
import { User } from "@/generated/prisma";
import { socketSessionWrapper } from "./socketSessionWrapper";
import {
	getWsMessageValidation,
} from "@/lib/backend/validations/wsValidations";
import { ZodError } from "zod";
import { AppError } from "@/lib/common/error";
import { handleClientConnect, handleClientDisconnect } from "@/lib/backend/webSockets/utils";

export const GET = requestWrapper(async (req: Request) => {
	const headers = new Headers();
	headers.set("Connection", "Upgrade");
	headers.set("Upgrade", "websocket");
	return new Response("Upgrade Required", { status: 426, headers });
});

export const SOCKET = socketSessionWrapper(
	(client: WebSocket, server: WebSocketServer, userId: User["id"] | null) => {

		// on connection ----------------->>> this is on connection
		handleClientConnect(client);

		// on close ---------------------->>> this is on disconnection
		client.on(`close`, ()=>{
			handleClientDisconnect(client);
		})

		// this is on message ------------->>>
		client.on("message", (message) => {
			try {
				const messageObj = JSON.parse(message.toString());
				const validatedMessage = getWsMessageValidation(userId).parse(messageObj);

				client.send(JSON.stringify(validatedMessage));
			} catch (e) {
				if (e instanceof ZodError) {
					client.send(
						JSON.stringify({
							status: 403,
							message: e.errors,
						})
					);
				} else if (e instanceof AppError) {
					client.send(
						JSON.stringify({
							status: e.status,
							message: e.message,
						})
					);
				} else {
					client.send(
						JSON.stringify({
							status: 500,
							message: "internal server error",
						})
					);
				}
			}
		});
	}
);
