import { NextFunction, Request, Response } from "express";
import { parseError } from "../../utils.js";

const errorMiddleWare = (err: any, req: Request, res: Response, next: NextFunction) => {
	const [status, message] = parseError(err);
	res.status(status).json({ message });
};

export default errorMiddleWare;
