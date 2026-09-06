import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CourseService } from "./course.service";

const createCourse = catchAsync(async (req, res) => {
	const payload = req.body;
	const admin = req.user as Express.User;
	const result = await CourseService.createCourse(payload, admin);

	sendResponse(res, {
		message: "Course created successfully",
		data: result,
	});
});

const updateCourseDetails = catchAsync(async (req, res) => {
	const payload = req.body;
	const admin = req.user as Express.User;
	const result = await CourseService.updateCourseDetails(payload, admin);

	sendResponse(res, {
		message: "Course details has been updated",
		data: result,
	});
});

const createNewCourseDetails = catchAsync(async (req, res) => {
	const payload = req.body;
	const admin = req.user as Express.User;
	const result = await CourseService.createNewCourseDetails(payload, admin);

	sendResponse(res, {
		message: "new course details has been created",
		data: result,
	});
});

const updateCourseStatus = catchAsync(async (req, res) => {
	const payload = req.body;
	const admin = req.user as Express.User;
	const result = await CourseService.updateCourseStatus(payload, admin);

	sendResponse(res, {
		message: "Course status has been updated",
		data: result,
	});
});

const assignCourseTeacher = catchAsync(async (req, res) => {
	const payload = req.body;
	const admin = req.user as Express.User;
	const result = await CourseService.assignCourseTeacher(payload, admin);

	sendResponse(res, {
		message:
			result === 0
				? "Teacher is already assigned to this course"
				: "Teacher assigned to course successfully",
		data: {
			teacher_assigned: result,
		},
	});
});

const getCourses = catchAsync(async (req, res) => {
	const user = req.user as Express.User;
	const department_id = req.params.departmentId as string | null;
	const result = await CourseService.getCourses(department_id, user);

	sendResponse(res, {
		message: "Courses data retrieved",
		data: result,
	});
});

export const CourseController = {
	createCourse,
	updateCourseDetails,
	createNewCourseDetails,
	updateCourseStatus,
	assignCourseTeacher,
	getCourses,
};
