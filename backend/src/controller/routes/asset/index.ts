import { Router } from "express";
import assetRouter from "./asset.js";
import assetsRouter from "./assets.js";
import contractPriceRouter from "./contract_price.js";
import markPriceRouter from "./mark_price.js";
import orderbookRouter from "./orderbook.js";
import tradeHistoryRouter from "./trade_history.js";

const router = Router();

router.use("/", assetRouter);
router.use("/all", assetsRouter);
router.use("/contract-price", contractPriceRouter);
router.use("/mark-price", markPriceRouter);
router.use("/orderbook", orderbookRouter);
router.use("/trade-history", tradeHistoryRouter);

export default router;  