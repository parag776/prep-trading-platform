import { Router } from "express";
import authRouter from "./auth/index.js";
import assetRouter from "./asset/index.js";
import chartRouter from "./chart/index.js";
import userRouter from "./user/index.js";
import depositRouter from "./deposit.js";
import placeOrderRouter from "./place_order.js";
import cancelOrderRouter from "./cancel_order.js"
const router = Router();

router.use("/auth", authRouter);
router.use("/asset", assetRouter);
router.use("/chart", chartRouter);
router.use("/user", userRouter);
router.use("/deposit", depositRouter);
router.use("/place-order", placeOrderRouter);
router.use("/cancel-order", cancelOrderRouter)

export default router;
