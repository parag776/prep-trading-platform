import { resolutionInfo } from "@/lib/common/data";
import { requestWrapper } from "../../requestWrapper";
import { getAllAssets } from "@/lib/backend/store/assetStore";

export const GET = requestWrapper(async function(req: Request){


    const resolutionSymbols = Array.from(resolutionInfo.values()).map(({symbol})=>symbol);

    const cryptoSymbols = [
        {
            symbol: getAllAssets().map(({symbol})=>symbol),
            description: getAllAssets().map(({name})=>name),
            exchange: "BINANCE",
            listed_exchange: "BINANCE",
            traded_exchange: "BINANCE",
            minmovement: 1,
            minmovement2: 0,
            fractional: false,
            pricescale: 100, // scale = 100 means 2 decimal digits (1 / 100 = 0.01)
            has_intraday: true,
            visible_plots_set: "ohlcv",
            type: "crypto",
            ticker: getAllAssets().map(({symbol})=>symbol),
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
        }
    ];

    return new Response(JSON.stringify(cryptoSymbols), {
        status: 200,
        headers: {
            "content-type": "application/json"
        }
    })
    
})