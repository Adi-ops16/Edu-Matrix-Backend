import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { DepartmentService } from "./department.service";

const createDepartment = catchAsync(async (req, res) => {
	const payload = req.body;
	const userId = req.user?.id as string;

	const result = await DepartmentService.createDepartment(payload, userId);

	sendResponse(res, {
		status: status.CREATED,
		message: "Department created",
		data: result,
	});
});

export const DepartmentController = { createDepartment };
