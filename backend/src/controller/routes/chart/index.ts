import { Router } from "express";
import configRouter from "./config.js";
import historyRouter from "./history.js";
import symbolInfoRouter from "./symbols.js";
import timeRouter from "./time.js";

const router = Router();

router.use("/config", configRouter);
router.use("/history", historyRouter);
router.use("/symbols", symbolInfoRouter);
router.use("/time", timeRouter);

export default router;  