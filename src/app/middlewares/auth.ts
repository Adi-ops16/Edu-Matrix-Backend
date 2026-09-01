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
		interface Request {
			user?: RequestUser;
		}
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
				role: decodedData.data.role,
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

		if (!roles.includes(user.role)) {
			throw new AppError(status.UNAUTHORIZED, "You are unauthorized");
		}

		req.user = decodedData.data;
		next();
	});
};

export default auth;
