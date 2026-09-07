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

export const UserController = { changePfP };
