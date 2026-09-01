import status from "http-status";
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

export const AuthController = { registerUser, verifyEmail };
