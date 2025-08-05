import { NextFunction, Request, Response, Router } from "express";

import jwt from "jsonwebtoken";

export function addJWTtoResponse(res: Response, user: Express.User){
    const {id} = user;
	const token = jwt.sign({id}, process.env.AUTHSECRET!, { expiresIn: "1h" });
	res.cookie("token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 3600 * 1000,
	});
}

export const asyncHandler = (fn: (req: Request, res: Response) => Promise<void>)  =>
(req: Request, res: Response, next: NextFunction) => {
  fn(req, res).catch(next);
}