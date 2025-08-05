import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import { handleClientConnect, handleClientDisconnect, handleSubscriptionMessage } from "./utils.js";
import { getOrderMessageValidation, getSubscribeMessageValidation } from "../validations/wsValidations.js";  
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { parseError } from "../utils.js";
import { AppError } from "../../../shared/error.mjs";
import { SubscriptionMessageWithUserId } from "../../../shared/types.mjs";
import { executeOrderCancellation, placeOrder } from "../exchangeController.js";

interface AuthedWebSocket extends WebSocket {
    user?: { id: string } | null;
  }

const wsServer = (server: Server) => {
	const wss = new WebSocketServer({ noServer: true });

	// upgrade the request to a websocket connection
	server.on("upgrade", (req, socket, head) => {
        const cookies = cookie.parse(req.headers.cookie || "");
        const token = cookies.token;

		wss.handleUpgrade(req, socket, head, (client: AuthedWebSocket) => {

			let payload: { id: string } | null = null;
			try {
				if (token && process.env.AUTHSECRET) {
					payload = jwt.verify(token, process.env.AUTHSECRET) as { id: string };
				}
			} catch (err) {

				console.log("authentication failed")
                console.log((err as Error).message);
            }
			client.user = payload; // store user on socket
			wss.emit("connection", client, req);
		});
	});

	// handle the websocket connection
	wss.on("connection", (client: AuthedWebSocket) => {
		handleClientConnect(client);
		client.on("message", async (message) => {
			try {
				const messageObj = JSON.parse(message.toString());

				const userId = client.user?.id ?? null;

				if(messageObj.type==="order"){
					if(!userId){
						throw new AppError("user is not authenticated", 401);
					}
					const validatedMessage = getOrderMessageValidation(userId).parse(messageObj);
					if(validatedMessage.action==="place"){
						await placeOrder(validatedMessage.payload, userId);
					} else {
						await executeOrderCancellation(userId, validatedMessage.payload.id);
					}
				} else {
					const validatedMessage = {...getSubscribeMessageValidation(userId).parse(messageObj), userId} as SubscriptionMessageWithUserId;
					handleSubscriptionMessage(validatedMessage, client);
				}
			} catch (err) {
				const [status, message] = parseError(err);
				client.send(JSON.stringify({status, message}));
            }
		});

		client.on("close", (client: WebSocket) => {
			handleClientDisconnect(client);
		});
	});
};

export default wsServer;
