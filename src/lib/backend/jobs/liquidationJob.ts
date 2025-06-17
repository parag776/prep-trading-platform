import { checkLiquidation } from "../exchangeController";
import { detailedUsersState } from "../store";
import { fixedGapSetInterval } from "../utils";


export function liquidationJob(ms: number){
	fixedGapSetInterval(()=>checkLiquidation(detailedUsersState), ms);
}