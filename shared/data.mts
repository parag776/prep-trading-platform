import { Resolution } from "../backend/src/generated/prisma/client.js";
import { ResolutionInfo } from "./types.mjs";

export let resolutionInfo: ResolutionInfo = new Map<Resolution, { symbol: string; duration: number }>([
	[Resolution.ONE_MINUTE, { symbol: "1", duration: 1000 * 60 }],
	[Resolution.THREE_MINUTE, { symbol: "3", duration: 3 * 1000 * 60 }],
	[Resolution.FIVE_MINUTE, { symbol: "5", duration: 5 * 1000 * 60 }],
	[Resolution.FIFTEEN_MINUTE, { symbol: "15", duration: 15 * 1000 * 60 }],
	[Resolution.THIRTY_MINUTE, { symbol: "30", duration: 30 * 1000 * 60 }],
	[Resolution.ONE_HOUR, { symbol: "60", duration: 60 * 1000 * 60 }],
	[Resolution.TWO_HOUR, { symbol: "120", duration: 120 * 1000 * 60 }],
	[Resolution.FOUR_HOUR, { symbol: "240", duration: 240 * 1000 * 60 }],
	[Resolution.SIX_HOUR, { symbol: "360", duration: 360 * 1000 * 60 }],
	[Resolution.EIGHT_HOUR, { symbol: "480", duration: 480 * 1000 * 60 }],
	[Resolution.TWELVE_HOUR, { symbol: "720", duration: 720 * 1000 * 60 }],
	[Resolution.ONE_DAY, { symbol: "1D", duration: 24 * 60 * 1000 * 60 }],
]);

export let resolutionSymbols = ["1", "3", "5", "15", "30", "60", "120", "240", "360", "480", "720", "1D"];

export function getResolutionFromString(resolutionString: string): Resolution {
	let resolution: Resolution = Resolution.ONE_MINUTE;
	for (let curRes of resolutionInfo) {
		if (curRes[1].symbol === resolutionString) {
			resolution = curRes[0];
			break;
		}
	}
	return resolution;
}
