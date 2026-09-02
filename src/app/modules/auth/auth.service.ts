import crypto from "node:crypto";
import path from "node:path";
import ejs from "ejs";
import status from "http-status";
import config from "../../config";
import transporter from "../../lib/nodeMailer";
import { prisma } from "../../lib/prisma";
import redisClient from "../../lib/redis";
import type { IJwtPayload } from "../../types";
import AppError from "../../utils/appError";
import { comparePassword, hashPassword } from "../../utils/hashPassword";
import { signToken } from "../../utils/jwt.js";
import uploadImage from "../../utils/uploadImage";
import { verifyOtp } from "../../utils/verifyOtp";
import type { IUser } from "../user/user.interface";
import type {
	TLoginPayload,
	TRegisterPayload,
	TVerifyOtpPayload,
} from "./auth.schema";

const registerUser = async (payload: TRegisterPayload) => {
	const { photo, email, name, password } = payload;

	const isUserExists = await prisma.user.findUnique({
		where: { email },
	});

	if (isUserExists && isUserExists.provider === "GOOGLE") {
		throw new AppError(
			status.CONFLICT,
			"You have already signed in with google. please login with google or set a password to enable credential login",
		);
	}

	if (isUserExists) {
		throw new AppError(
			status.BAD_REQUEST,
			"User already exists with this email. please login",
		);
	}

	const hashedPassword = await hashPassword(password);
	const photoDetails = await uploadImage(photo?.buffer, {
		folder: "profile/avatar",
	});

	// OTP set to redis
	const otpValue = crypto.randomInt(100000, 1000000).toString();
	const redisOtpKey = `verify-email-otp:${email}`;

	await redisClient.set(redisOtpKey, otpValue, {
		expiration: {
			type: "EX",
			value: 60 * 5,
		},
	});

	// User data set to redis
	const redisUserDataKey = `user-data:${email}`;
	const redisUserDataValue = JSON.stringify({
		...payload,
		password: hashedPassword,
		photo: photoDetails?.secure_url,
		photo_public_id: photoDetails?.public_id,
	});

	await redisClient.set(redisUserDataKey, redisUserDataValue, {
		expiration: {
			type: "EX",
			value: 60 * 5,
		},
	});

	// email sending
	const filePath = path.join(
		process.cwd(),
		"/src/app/templates/registration-otp.ejs",
	);
	const htmlData = {
		name,
		otp: otpValue,
		email,
		expirationMinutes: 5,
	};
	const html = await ejs.renderFile(filePath, htmlData);

	transporter.sendMail({
		from: config.email_sender,
		to: email,
		subject: "Your registration otp for Edu-Matrix",
		html,
	});
};

const verifyEmail = async (payload: TVerifyOtpPayload) => {
	const isUserExists = await prisma.user.findUnique({
		where: { email: payload.email },
	});

	if (isUserExists) {
		throw new AppError(status.NOT_FOUND, "User exists. please login");
	}

	const redisKey = `verify-email-otp:${payload.email}`;
	await verifyOtp({
		otp: Number(payload.otp),
		otpKey: redisKey,
	});

	const redisUserDataKey = `user-data:${payload.email}`;
	const userDataJson = await redisClient.get(redisUserDataKey);

	if (!userDataJson) {
		throw new AppError(
			status.NOT_FOUND,
			"your data has been expired. please try registering again",
		);
	}

	const userData = JSON.parse(userDataJson) as {
		name: string;
		email: string;
		password: string;
		photo: string;
		photo_public_id: string;
	};

	const user = await prisma.user.create({
		data: {
			email: userData.email,
			name: userData.name,
			provider: "CREDENTIALS",
			password: userData.password,
			profile_url: userData.photo,
			profile_public_id: userData.photo_public_id,
			is_verified: true,
		},
		omit: { password: true },
	});

	// delete user data from redis
	await redisClient.del(redisUserDataKey);

	const jwtPayload: IJwtPayload = {
		id: user.id,
		email: user.email,
		role: user.role,
	};

	const access_token = signToken(jwtPayload, config.jwt_access_secret);
	const refresh_token = signToken(jwtPayload, config.jwt_refresh_secret);

	return {
		access_token,
		refresh_token,
		user,
	};
};

const googleCallback = async (user: IUser) => {
	const jwtPayload = {
		id: user.id,
		email: user.email,
		role: user.role,
	};
	const access_token = signToken(jwtPayload, config.jwt_access_secret);
	const refresh_token = signToken(jwtPayload, config.jwt_refresh_secret);

	return {
		access_token,
		refresh_token,
	};
};

const login = async (payload: TLoginPayload) => {
	const { email, password } = payload;

	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (!user) {
		throw new AppError(status.NOT_FOUND, "No user found, please register");
	}

	if (!user.password || user.google_id || user.provider === "GOOGLE") {
		throw new AppError(
			status.CONFLICT,
			"You have signed in with google. please login with google or set a password to enable credential login",
		);
	}

	const isPasswordValid = await comparePassword(password, user.password);

	if (!isPasswordValid) {
		throw new AppError(status.UNAUTHORIZED, "Invalid credentials");
	}

	const jwtPayload = {
		id: user.id,
		email: user.email,
		role: user.role,
	};
	const access_token = signToken(jwtPayload, config.jwt_access_secret);
	const refresh_token = signToken(jwtPayload, config.jwt_refresh_secret);

	return {
		access_token,
		refresh_token,
	};
};

export const AuthService = { registerUser, verifyEmail, googleCallback, login };
