import { Router } from "express";
import localRouter from "./local.js"
import GoogleStrategy from "passport-google-oauth20"
import GithubStrategy from "passport-github2";
import { getOauthRoutes } from "./oAuth.js";
import logoutRouter from "./logout.js";   

const strategies = {
    "google": GoogleStrategy,
    "github": GithubStrategy,
}

const router = Router();

router.use("/local", localRouter)

for(const [authoriser, Strategy] of Object.entries(strategies)){
    router.use(`/${authoriser}`, getOauthRoutes(authoriser, Strategy))
}

router.use("/logout", logoutRouter)

export default router;
