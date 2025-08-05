import { getHistoricalDataFromDB } from "../../../../src/database.js";
import { getResolutionFromString } from "../../../../../shared/data.mjs";
import { getSecondsFromDate } from "../../../utils.js";
import { historyValidation } from "../../../validations/chartValidations.js";
import { Request, Response, Router } from "express";
import z, { ZodError } from "zod";

const router = Router();

const formatHistoricalDataForResponse = (
	fetchedData: Array<{
		timestamp: Date;
		open: number;
		high: number;
		low: number;
		close: number;
		volume: number;
	}>
) => {
	let data = {
		s: "ok",
		t: Array<number>(),
		o: Array<number>(),
		h: Array<number>(),
		l: Array<number>(),
		c: Array<number>(),
		v: Array<number>(),
	};

	for (let datum of fetchedData) {
		data.t.push(getSecondsFromDate(datum.timestamp));
		data.c.push(datum.close);
		data.o.push(datum.open);
		data.h.push(datum.high);
		data.l.push(datum.low);
		data.v.push(datum.volume);
	}
	return data;
};

router.get("/", async (req: Request, res: Response) => {

	try {
		const params = {
			symbol: req.query.symbol,
			from: req.query.from,
			to: req.query.to,
			resolutionString: req.query.resolution,
			countback: req.query.countback,
		};

		const { assetId, from, to, resolutionString, countback } = historyValidation.parse(params);

		const resolution = getResolutionFromString(resolutionString);

		const fetchedData = await getHistoricalDataFromDB(assetId, to, resolution, countback);

		if (fetchedData.length === 0) {

			res.status(200).json({
				s: "no_data",
			});
			return;
		}
 
		const data = formatHistoricalDataForResponse(fetchedData);

		res.status(200).json(data);
	} catch (error) {
		if (error instanceof ZodError) {
			res.status(500).json({
				s: "error",
				errmsg: z.prettifyError(error),
			});
		} else {
			res.status(500).json({
				s: "error",
				errmsg: "Internal server error",
			});
		}
	}
});

export default router;
