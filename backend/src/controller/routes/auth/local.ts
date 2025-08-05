import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { createLocalUserToDB, getUserFromUsernameFromDB } from "../../../database.js";
import { Router } from "express";
import { registrationValidation } from "../../../validations/userValidations.js";
import bcrypt from "bcrypt";
import { addJWTtoResponse, asyncHandler } from "../../utils.js";
import { createUser, getUserIdentity } from "../../../store/userStore.js";

passport.use(
	new LocalStrategy(
		{
			usernameField: "username", 
			passwordField: "password",
			session: false, 
		},
		async (username, password, done) => {
			try {
				const user = await getUserFromUsernameFromDB(username);

				if (!user || !user.password) {
					return done(null, false, { message: "Invalid username or password" });
				}

				const isMatch = await bcrypt.compare(password, user.password);
				if (!isMatch) {
					return done(null, false, { message: "Invalid username or password" });
				}

				return done(null, {id: user.id});
			} catch (err) {
				return done(err);
			}
		}
	)
);

const router = Router();

router.post("/login", passport.authenticate("local", { session: false }), (req, res) => {
	// req.user is already set by passport if authentication succeeded

	const user = req.user!

	addJWTtoResponse(res, user);

	res.send(getUserIdentity(user.id));
});

router.post(
	"/register",
	asyncHandler(async (req, res) => {
		const userDetails = registrationValidation.parse(req.body);

		// Check if user already exists
		const existingUser = await getUserFromUsernameFromDB(userDetails.username);
		if (existingUser) {
			res.status(409).json({ message: "Username already exists" });
			return;
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(userDetails.password, 10);

		// Create user
		const user = await createLocalUserToDB(userDetails.username, userDetails.name,  hashedPassword);
		const {password, ...userWithoutPassword} = user;
		createUser(userWithoutPassword);
		

		addJWTtoResponse(res, user);

		res.status(201).json(getUserIdentity(user.id));
	})
);

export default router;
