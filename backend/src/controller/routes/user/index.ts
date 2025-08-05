import { Router } from "express";
import infoRouter from "./info.js";
import accountMetricsRouter from "./account_metrics.js";            
import balanceRouter from "./balance.js";
import openOrdersRouter from "./open_orders.js";
import orderHistoryRouter from "./order_history.js";
import positionsRouter from "./positions.js";
import userIdentityRouter from "./user_identity.js";

const router = Router();

router.use("/", infoRouter);
router.use("/account-metrics", accountMetricsRouter);
router.use("/user-identity", userIdentityRouter);
router.use("/balance", balanceRouter);
router.use("/open-orders", openOrdersRouter);
router.use("/order-history", orderHistoryRouter);
router.use("/positions", positionsRouter);      

export default router;      