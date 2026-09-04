import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { StudentService } from "./student.service";

const createStudentProfile = catchAsync(async (req, res) => {
	const payload = req.body;
	const user_id = req.user?.id ?? null;
	const result = await StudentService.createStudentProfile;

	sendResponse(res, {
		message: "Student profile created",
		data: result,
	});
});

export const StudentController = { createStudentProfile };
