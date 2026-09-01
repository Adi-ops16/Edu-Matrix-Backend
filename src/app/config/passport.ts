import status from "http-status";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../lib/prisma";
import AppError from "../utils/appError";
import config from ".";

passport.use(
	new GoogleStrategy(
		{
			clientID: config.google_client_id,
			clientSecret: config.google_client_secret,
			callbackURL: config.google_client_cb_url,
		},
		async (_accessToken, _refreshToken, profile, done) => {
			try {
				const email = profile.emails?.[0]?.value;

				if (!email) {
					return done(
						new AppError(status.BAD_REQUEST, "No email found from Google"),
					);
				}

				let user = await prisma.user.findUnique({
					where: { email },
				});

				if (!user) {
					user = await prisma.user.create({
						data: {
							email,
							name: profile.displayName,
							google_id: profile.id,
							is_verified: true,
							profile_url: profile.photos?.[0]?.value || null,
							provider: "GOOGLE",
						},
					});
				} else if (user.provider === "CREDENTIALS") {
					user = await prisma.user.update({
						where: { email },
						data: {
							google_id: profile.id,
						},
					});
				} else if (profile.id !== user.google_id) {
					throw new AppError(
						status.BAD_REQUEST,
						"This email is already linked to a different google account",
					);
				}

				return done(null, user);
			} catch (error) {
				return done(error);
			}
		},
	),
);
