import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TeacherService } from "./teacher.service";

const updateTeacherProfile = catchAsync(async (req, res) => {
	const payload = req.body;
	const user_id = req.user?.id ?? null;

	const result = await TeacherService.updateTeacherProfile(payload, user_id);

	sendResponse(res, {
		message: "Teacher profile updated",
		data: result,
	});
});

const getInstitutionTeachers = catchAsync(async (req, res) => {
	const admin = req.user as Express.User;

	const result = await TeacherService.getInstitutionTeachers(admin);

	sendResponse(res, {
		message: "Teacher profile retrieved",
		data: result,
	});
});

export const TeacherController = {
	updateTeacherProfile,
	getInstitutionTeachers,
};
