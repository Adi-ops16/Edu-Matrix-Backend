import status from "http-status";
import passport from "passport";
import config from "../../config";
import AppError from "../../utils/appError";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthService } from "./auth.service";

const registerUser = catchAsync(async (req, res, _) => {
	await AuthService.registerUser(req.body);

	sendResponse(res, {
		status: status.OK,
		message: "OTP has been sent to email",
	});
});

const verifyEmail = catchAsync(async (req, res) => {
	const result = await AuthService.verifyEmail(req.body);

	res.cookie("access_token", result.access_token, {
		httpOnly: true,
		sameSite: "lax",
		secure: false,
		maxAge: 1000 * 60 * 60 * 24,
	});

	res.cookie("refresh_token", result.refresh_token, {
		httpOnly: true,
		sameSite: "lax",
		secure: false,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	});

	sendResponse(res, {
		message: "Email verified successful",
		data: result,
	});
});

const googleCallback = catchAsync(async (req, res, next) => {
	// biome-ignore lint/suspicious/noExplicitAny: <google provided type>
	passport.authenticate("google", async (err: any, user: any, _info: any) => {
		try {
			if (err) {
				return next(
					new AppError(status.UNAUTHORIZED, "Google authentication failed"),
				);
			}

			if (!user) {
				return next(
					new AppError(status.UNAUTHORIZED, "Google authentication failed"),
				);
			}
			const { access_token, refresh_token } =
				await AuthService.googleCallback(user);

			res.cookie(access_token, access_token, {
				httpOnly: true,
				sameSite: "lax",
				secure: false,
				maxAge: 60 * 1000 * 60 * 24,
			});
			res.cookie(refresh_token, refresh_token, {
				httpOnly: true,
				sameSite: "lax",
				secure: false,
				maxAge: 60 * 1000 * 60 * 24,
			});

			res.redirect(`${config.frontend_url}/auth/success`);
		} catch (error) {
			console.log(error);
			next(
				new AppError(
					status.INTERNAL_SERVER_ERROR,
					"Google authentication failed",
				),
			);
		}
	})(req, res, next);
});

export const AuthController = { registerUser, verifyEmail, googleCallback };
