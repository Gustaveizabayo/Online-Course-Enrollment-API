import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-outh20";
import { env } from "../config/env";
import { prisma } from "../config/postgres";

passport.use(
    new GoogleStrategy(
        {
            clientID: env.googleClientId,
            clientSecret: env.googleClientSecret,
            callbackURL: env.googleCallbackUrl
        },

        async (_accessToken, _refreshToekn, profile, done) => {
            const email = profile.emails?.[0].value;
            if (!email) return done(null, false);
            let user = await prisma.user.findUnique({ where: { email }});
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        email,
                        name: profile.displayName || "Google User",
                        provider: "google",
                        role: "student"
                    }
                });
            }
            return done(null, user);

            

        }
    )
);
export default passport;