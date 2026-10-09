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
	const query = req.query;

	const { data, meta } = await TeacherService.getInstitutionTeachers(
		admin,
		query,
	);

	sendResponse(res, {
		message: "Teachers retrieved",
		data,
		meta,
	});
});

const getDepartmentTeachers = catchAsync(async (req, res) => {
	const admin = req.user as Express.User;
	const query = req.query;
	const department_id = req.params.department_id as string | null;

	const { data, meta } = await TeacherService.getDepartmentTeachers(
		admin,
		department_id,
		query,
	);

	sendResponse(res, {
		message: "Department Teachers retrieved",
		data,
		meta,
	});
});

const getTeachersToAssignToCourse = catchAsync(async (req, res) => {
	const courseDetailsId = Number(req.params.courseDetailsId) as number | null;
	const query = req.query;
	const result = await TeacherService.getTeachersToAssignToCourse(
		courseDetailsId,
		query,
	);

	sendResponse(res, {
		message: "Teachers retrieved to assign to course",
		data: result,
	});
});

export const TeacherController = {
	updateTeacherProfile,
	getInstitutionTeachers,
	getDepartmentTeachers,
	getTeachersToAssignToCourse,
};
