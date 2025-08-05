import { checkLiquidation } from "../exchangeController.js";
import { fixedGapSetInterval } from "../utils.js";

export function liquidationJob(ms: number) {
	fixedGapSetInterval(() => checkLiquidation(), ms);
}
