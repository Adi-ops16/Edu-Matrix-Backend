import type { Role } from "../../../../generated/prisma/enums";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserService } from "./user.service";

const changePfP = catchAsync(async (req, res) => {
	const picture = req.file as Express.Multer.File;
	const user = req.user as Express.User;

	const result = await UserService.changePfP(picture, user);

	sendResponse(res, {
		message: "Profile updated Successfully",
		data: result,
	});
});

const updateUserProfile = catchAsync(async (req, res) => {
	const payload = req.body;
	const user = req.user as Express.User;

	const result = await UserService.updateUserProfile(user, payload);

	sendResponse(res, {
		message: "Profile updated Successfully",
		data: result,
	});
});

const getMyProfile = catchAsync(async (req, res) => {
	const userId = req.user?.id as string;
	const role = req.user?.role as Role;

	const result = await UserService.getMyProfile(userId, role);

	sendResponse(res, {
		message: "Profile data fetched Successfully",
		data: result,
	});
});

export const UserController = { changePfP, getMyProfile, updateUserProfile };
