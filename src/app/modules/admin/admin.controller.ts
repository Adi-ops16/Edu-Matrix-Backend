import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AdminService } from "./admin.service";

const getPlatformOverview = catchAsync(async (_req, res) => {
	const result = await AdminService.getPlatformOverview();
	sendResponse(res, {
		message: "Retrieved platform overview",
		data: result,
	});
});

export const AdminController = { getPlatformOverview };
