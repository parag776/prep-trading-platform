import { Router, Request, Response } from "express";
import { resolutionInfo } from "../../../../../shared/data.mjs";
import { getAssetsFromDB } from "../../../database.js";
import { asyncHandler } from "../../utils.js";

const router = Router();

router.get("/", asyncHandler(async (req: Request, res: Response) => {
    // Fetch all assets from the database

    const {symbol} = req.query

    const assets = await getAssetsFromDB();

    // Get supported resolution symbols
    const resolutionSymbols = Array.from(resolutionInfo.values()).map(({symbol}) => symbol);

    const cryptoSymbols = 
        {
            symbol: symbol,
            description: assets.find((asset)=>asset.symbol===symbol)?.name,
            name: symbol,
            exchange: "COINBOOK",
            listed_exchange: "COINBOOK",
            traded_exchange: "COINBOOK",
            minmovement: 1,
            minmovement2: 0,
            fractional: false,
            pricescale: 100, // scale = 100 means 2 decimal digits (1 / 100 = 0.01)
            has_intraday: true,
            visible_plots_set: "ohlcv",
            type: "crypto",
            ticker: symbol,
            timezone: "Etc/UTC",
            session: "24x7",
            session_holidays: "",
            corrections: "",
            supported_resolutions: resolutionSymbols,
            force_session_rebuild: false,
            has_daily: true,
            has_weekly_and_monthly: true,
            volume_precision: 4,
            has_empty_bars: true
        };
    res.status(200).json(cryptoSymbols);
}));

export default router;