import type { NextFunction, Request, Response } from "express";
import status from "http-status";
import passport from "passport";
import config from "../../config";
import AppError from "../../utils/appError";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import type { IUser } from "../user/user.interface";
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
		status: status.CREATED,
		message: "Email verified and user registration successful",
		data: result,
	});
});

const googleCallback = (req: Request, res: Response, next: NextFunction) => {
	passport.authenticate(
		"google",
		{ session: false },
		async (err: unknown, user: IUser | false) => {
			if (err) {
				return next(err);
			}

			if (!user) {
				return next(
					new AppError(status.UNAUTHORIZED, "Google authentication failed"),
				);
			}

			try {
				const { access_token, refresh_token } =
					await AuthService.googleCallback(user);

				res.cookie("access_token", access_token, {
					httpOnly: true,
					sameSite: "lax",
					secure: config.environment === "production",
					maxAge: 24 * 60 * 60 * 1000,
				});

				res.cookie("refresh_token", refresh_token, {
					httpOnly: true,
					sameSite: "lax",
					secure: config.environment === "production",
					maxAge: 7 * 24 * 60 * 60 * 1000,
				});

				return res.redirect(`${config.frontend_url}/auth/success`);
			} catch (error) {
				return next(error);
			}
		},
	)(req, res, next);
};

const login = catchAsync(async (req, res) => {
	const result = await AuthService.login(req.body);

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
		message: "Login successful",
		data: result,
	});
});

export const AuthController = {
	registerUser,
	verifyEmail,
	googleCallback,
	login,
};
