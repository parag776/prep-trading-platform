import { checkLiquidation } from "../exchangeController";
import { fixedGapSetInterval } from "../utils";

export function liquidationJob(ms: number) {
	fixedGapSetInterval(() => checkLiquidation(), ms);
}
