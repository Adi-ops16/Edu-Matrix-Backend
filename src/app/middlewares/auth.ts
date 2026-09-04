import status from "http-status";
import type { Role } from "../../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";
import type { RequestUser } from "../types";
import AppError from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";
import { verifyToken } from "../utils/jwt";

declare global {
	namespace Express {
		interface User extends RequestUser {}
	}
}

const auth = (...roles: Role[]) => {
	return catchAsync(async (req, _, next) => {
		const token = req.cookies?.access_token
			? req.cookies?.access_token
			: req.headers.authorization?.startsWith("Bearer ")
				? req.headers.authorization?.split(" ")[1]
				: req.headers.authorization;

		if (!token) {
			throw new AppError(
				status.BAD_REQUEST,
				"You are not logged in. Please log in to access this resource.",
			);
		}

		const decodedData = verifyToken(token, config.jwt_access_secret);

		if (!decodedData.success || !decodedData.data) {
			throw new AppError(status.BAD_REQUEST, `${decodedData.message}`);
		}

		const user = await prisma.user.findUnique({
			where: {
				id: decodedData.data.id,
			},
		});

		if (!user) {
			throw new AppError(status.NOT_FOUND, "User not found");
		}

		if (user.user_status === "BAN") {
			throw new AppError(
				status.UNAUTHORIZED,
				"You are banned. please contact support",
			);
		}

		if (user.is_deleted) {
			throw new AppError(status.NOT_FOUND, "No account found.");
		}

		if (!user.is_active) {
			throw new AppError(status.BAD_REQUEST, "Your account is inactive.");
		}

		if (!user.is_verified) {
			throw new AppError(
				status.BAD_REQUEST,
				"Your account is not verified. Please verify your account to access this resource.",
			);
		}

		if (roles.length > 0) {
			if (user.member_status !== "APPROVED") {
				throw new AppError(
					status.FORBIDDEN,
					"Your account is not approved. please contact support for more information",
				);
			}
			if (!user.role || !roles.includes(user.role)) {
				throw new AppError(status.UNAUTHORIZED, "You are unauthorized");
			}
		}

		req.user = {
			id: user.id,
			email: user.email,
			role: user.role,
			institution_id: user.institution_id,
		};
		next();
	});
};

export default auth;
