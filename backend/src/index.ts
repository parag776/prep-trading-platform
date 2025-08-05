import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import errorMiddleWare from "./controller/middlewares/error.js";
import cookieParser from "cookie-parser";
import apiRouter from "./controller/routes/index.js";
import { initialization } from "./store/index.js";
import wsServer from "./webSocket/wsServer.js";

dotenv.config();

const app = express();
const server = createServer(app);

app.use(express.json()); // application/json
app.use(express.urlencoded({ extended: true })); // for application/x-www-form-urlencoded
app.use(cookieParser());

// initialize state
await initialization();
// api routes
app.use("/api", apiRouter);

// websocket
wsServer(server);

// error middleware
app.use(errorMiddleWare);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
