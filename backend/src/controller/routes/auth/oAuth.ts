import passport, { Profile } from "passport";
import { createOauthUserToDB } from "../../../database.js";
import { Router } from "express";
import { addJWTtoResponse } from "../../utils.js";
import OAuth2Strategy = require("passport-oauth2");
import dotenv from "dotenv"
import { createUser, getUserIdentity, isUser } from "../../../store/userStore.js";

dotenv.config();

export function getOauthRoutes(authoriser: string, Strategy: any) {
	const clientId = process.env[`${authoriser.toUpperCase()}_CLIENT_ID`] || "";
	const clientSecret = process.env[`${authoriser.toUpperCase()}_CLIENT_SECRET`] || "";
	const callbackURL = `/api/auth/${authoriser}/callback`;

	passport.use(
		new Strategy(
			{
				clientID: clientId,
				clientSecret: clientSecret,
				callbackURL: callbackURL,
			},
			async (accessToken: string, refreshToken: string, profile: Profile, done: OAuth2Strategy.VerifyCallback) => {
				try {
					const id = authoriser+":"+profile.id;
					if (isUser(id)) {
						return done(null, {id});
					}
					console.log(profile);
					const newUser = await createOauthUserToDB(id, profile.displayName ?? profile.username ?? "John Doe", profile.photos?.[0]?.value ?? null); // user and
					createUser(newUser);
					return done(null, {id});
				} catch (err) {
					return done(err, undefined);
				}
			}
		)
	);
	
	const router = Router();

	router.get(
		"/",
		passport.authenticate(authoriser, {
			scope: ["profile"],
			session: false,
		})
	);


	router.get(
	  "/callback",
	  passport.authenticate(authoriser, { session: false }),
	  (req, res) => {
		console.log("reached here.");
		const user = req.user!;
		const userIdentity = getUserIdentity(user.id);
		addJWTtoResponse(res, user);

		const frontend_url = process.env.FRONTEND_URL;
		res.redirect(`${frontend_url}#loginSuccess`);
	  }
	);

	return router
}

