import passport from "passport";
import dotenv from "dotenv"
import { Strategy as JwtStrategy } from "passport-jwt";
import { Request } from "express";

dotenv.config();

function cookieExtractor(req: Request) {
    return req?.cookies?.token ?? null;
}

passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: cookieExtractor,
            secretOrKey: process.env.AUTHSECRET!,
        },
        (payload, done) => {
            return done(null, payload);
        }
    )
);

export const auth = passport.authenticate("jwt", { session: false });