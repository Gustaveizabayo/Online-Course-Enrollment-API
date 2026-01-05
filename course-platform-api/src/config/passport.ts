import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import { prisma } from '../database/prisma';
import { hashPassword } from '../utils/bcrypt';
import { Role } from '@prisma/client';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        if (!user) {
          // Check if user exists with email
          user = await prisma.user.findUnique({
            where: { email: profile.emails?.[0].value || '' },
          });

          if (user) {
            // Link Google account to existing user
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId: profile.id },
            });
          } else {
            // Create new user
            user = await prisma.user.create({
              data: {
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails?.[0].value || '',
                role: Role.STUDENT,
                password: await hashPassword(Math.random().toString(36).slice(-8)),
              },
            });
          }
        }

        done(null, user);
      } catch (error) {
        done(error as Error, undefined);
      }
    }
  )
);

export default passport;