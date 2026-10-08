import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { StudentService } from "./student.service";

const updateStudentProfile = catchAsync(async (req, res) => {
	const payload = req.body;
	const user_id = req.user?.id ?? null;

	const result = await StudentService.updateStudentProfile(payload, user_id);

	sendResponse(res, {
		message: "Student profile updated",
		data: result,
	});
});

const getInstitutionStudents = catchAsync(async (req, res) => {
	const admin = req.user as Express.User;
	const query = req.query;
	const result = await StudentService.getInstitutionStudents(admin, query);

	sendResponse(res, {
		message: "Institution Students fetched successfully",
		data: result.data,
		meta: result.meta,
	});
});

export const StudentController = {
	updateStudentProfile,
	getInstitutionStudents,
};
