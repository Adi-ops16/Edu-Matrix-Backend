import status from "http-status";
import { prisma } from "../../lib/prisma";
import type { IQuery } from "../../types";
import AppError from "../../utils/appError";
import { removeUndefined } from "../../utils/removeUndefined";
import type {
	TAssignTeacherPayload,
	TCreateCoursePayload,
	TCreateNewCourseDetailsPayload,
	TUpdateCourseDetailsPayload,
	TUpdateCourseStatusPayload,
} from "./course.schema";

const createCourse = async (
	payload: TCreateCoursePayload,
	admin: Express.User,
) => {
	const {
		code,
		course_details,
		department_id,
		learning_outcomes,
		title,
		description,
	} = payload;

	// biome-ignore lint/suspicious/noExplicitAny: <flexibility on creating course and course details>
	const courseData: any = {
		code,
		department_id,
		learning_outcomes,
		title,
		description,
	};

	if (course_details) {
		const refinedDetails = removeUndefined(course_details);
		courseData.course_details = {
			create: {
				batch: refinedDetails.batch,
				semester: refinedDetails.semester,
				end_date: refinedDetails.end_date,
				start_date: refinedDetails.start_date,
				status: refinedDetails.status,
				price: refinedDetails.price,
				currency: refinedDetails.currency,
			},
		};
	}

	const department = await prisma.department.findFirst({
		where: {
			id: department_id,
		},
		include: {
			institution: true,
		},
	});

	if (department?.institution_id !== admin.institution_id) {
		throw new AppError(
			status.BAD_REQUEST,
			"You cannot create course for other institutions",
		);
	}

	const course = await prisma.course.create({
		data: courseData,
		include: {
			course_details: true,
			department: {
				select: {
					code: true,
					name: true,
				},
			},
		},
	});

	return course;
};

const createNewCourseDetails = async (
	payload: TCreateNewCourseDetailsPayload,
	admin: Express.User,
) => {
	if (!admin.institution_id) {
		throw new AppError(
			status.BAD_REQUEST,
			"Admin doesn't belong to an institution",
		);
	}

	const isCourseExists = await prisma.course.findFirst({
		where: {
			id: payload.course_id,
		},
	});

	if (!isCourseExists) {
		throw new AppError(status.NOT_FOUND, "No course has been found");
	}

	const {
		batch,
		price,
		semester,
		status: course_status,
		end_date,
		start_date,
	} = payload.details;

	const courseDetails = await prisma.courseDetails.create({
		data: {
			course_id: payload.course_id,
			batch,
			price,
			semester,
			status: course_status,
			end_date: end_date ?? null,
			start_date: start_date ?? null,
		},
		include: {
			course: true,
		},
	});

	return courseDetails;
};

const updateCourseDetails = async (
	payload: TUpdateCourseDetailsPayload,
	admin: Express.User,
) => {
	if (!admin.institution_id) {
		throw new AppError(
			status.BAD_REQUEST,
			"admin is not associated with any institution",
		);
	}

	const courseDetails = await prisma.courseDetails.findFirst({
		where: {
			id: payload.course_details_id,
			course: {
				department: {
					institution_id: admin.institution_id,
				},
			},
		},
		select: {
			id: true,
			course_id: true,
		},
	});

	if (!courseDetails) {
		throw new AppError(status.NOT_FOUND, "Course details not found");
	}

	const { course_details_id, ...refinedPayload } = removeUndefined(payload);

	const updatedCourseDetails = await prisma.courseDetails.update({
		where: {
			id: course_details_id,
		},
		data: refinedPayload,
	});

	return updatedCourseDetails;
};

const updateCourseStatus = async (
	payload: TUpdateCourseStatusPayload,
	admin: Express.User,
) => {
	if (!admin.institution_id) {
		throw new AppError(
			status.BAD_REQUEST,
			"Admin doesn't belong to an institution",
		);
	}

	const { course_details_id, status: course_status } = payload;

	const courseDetails = await prisma.courseDetails.findFirst({
		where: {
			id: payload.course_details_id,
			course: {
				department: {
					institution_id: admin.institution_id,
				},
			},
		},
		select: {
			id: true,
			course_id: true,
			status: true,
		},
	});

	if (!courseDetails) {
		throw new AppError(status.NOT_FOUND, "Course details not found");
	}

	if (courseDetails.status === "COMPLETED") {
		throw new AppError(status.CONFLICT, "Course is already completed");
	}

	if (courseDetails.status === "UPCOMING" && course_status === "COMPLETED") {
		throw new AppError(
			status.CONFLICT,
			"Cannot complete a course that is not started yet",
		);
	}

	const existingOngoingCourse = await prisma.courseDetails.findFirst({
		where: {
			course_id: courseDetails.course_id,
			status: "ONGOING",
			id: {
				not: course_details_id,
			},
		},
		select: {
			id: true,
		},
	});

	if (existingOngoingCourse) {
		throw new AppError(
			status.CONFLICT,
			"This course already has an ongoing batch",
		);
	}

	const updatedCourseDetails = await prisma.courseDetails.update({
		where: { id: course_details_id },
		data: {
			status: course_status,
		},
		include: {
			course: true,
		},
	});

	return updatedCourseDetails;
};

const assignCourseTeacher = async (
	payload: TAssignTeacherPayload,
	admin: Express.User,
) => {
	if (!admin.institution_id) {
		throw new AppError(
			status.BAD_REQUEST,
			"Admin is not associated with any institution",
		);
	}

	const existingCourseDetails = await prisma.courseDetails.findFirst({
		where: {
			id: payload.course_details_id,
			course: {
				department: {
					institution_id: admin.institution_id,
				},
			},
		},
	});

	if (!existingCourseDetails) {
		throw new AppError(status.NOT_FOUND, "Course details not found");
	}

	if (existingCourseDetails.status === "COMPLETED") {
		throw new AppError(
			status.NOT_FOUND,
			"Cannot assign teacher into a completed course",
		);
	}

	const teachers = await prisma.teacher.findMany({
		where: {
			teacher_id: {
				in: payload.teacher_id,
			},
			user: {
				institution_id: admin.institution_id,
			},
		},
		select: {
			teacher_id: true,
		},
	});

	if (teachers.length !== payload.teacher_id.length) {
		throw new AppError(
			status.BAD_REQUEST,
			"One or more teachers do not belong to this institution",
		);
	}

	const teacherData = payload.teacher_id.map((id) => ({
		course_details_id: payload.course_details_id,
		teacher_id: id,
	}));

	const assignedTeacher = await prisma.courseTeacher.createMany({
		data: teacherData,
		skipDuplicates: true,
	});

	return assignedTeacher.count;
};

const getCourses = async (
	department_id: string | null,
	user: Express.User,
	_query: IQuery,
) => {
	if (!user.institution_id) {
		throw new AppError(
			status.BAD_REQUEST,
			"User is not associated with any institution",
		);
	}

	if (!department_id) {
		throw new AppError(status.BAD_REQUEST, "Department id is not provided");
	}

	const coursesResponse = await prisma.course.findMany({
		where: {
			department: {
				id: department_id,
				institution_id: user.institution_id,
			},
		},
		include: {
			course_details: {
				where: {
					status: "ONGOING",
				},
				omit: {
					created_at: true,
					updated_at: true,
				},
			},
		},
		omit: {
			created_at: true,
			updated_at: true,
		},
	});

	const courses = coursesResponse.map((course) => ({
		...course,
		course_details: course.course_details[0] ?? null,
	}));

	return courses;
};

const getAdminCourseDetails = async (
	course_id: string | null,
	query: IQuery,
) => {
	const sortOrder = query.sortOrder ? query.sortOrder : "desc";
	const sortBy = query.sortBy ? query.sortBy : "created_at";

	if (!course_id) {
		throw new AppError(
			status.BAD_REQUEST,
			"Please provide the courseId in query params",
		);
	}

	const courseDetails = await prisma.courseDetails.findMany({
		where: {
			course_id,
		},
		orderBy: {
			[sortBy]: sortOrder,
		},
	});

	return courseDetails;
};

const getCourseDetails = async (course_id: string | null) => {
	if (!course_id) {
		throw new AppError(
			status.BAD_REQUEST,
			"Please provide courseId in query params",
		);
	}

	const response = await prisma.courseDetails.findFirst({
		where: {
			course_id,
			status: "ONGOING",
		},
		include: {
			teachers: {
				select: {
					teacher: {
						select: {
							degree: true,
							specialization: true,
							certificate_url: true,
							user: {
								select: {
									name: true,
									profile_url: true,
								},
							},
						},
					},
				},
			},
			course: {
				select: {
					department: {
						select: {
							name: true,
							department_description: true,
							department_established_year: true,
							code: true,
						},
					},
				},
			},
		},
		omit: {
			created_at: true,
			updated_at: true,
		},
	});

	const { teachers, course, ...rest } = response || {};

	const structuredTeachers = teachers?.map((t) => ({
		name: t.teacher.user.name,
		profile_url: t.teacher.user.profile_url,
		degree: t.teacher.degree,
		certificate_url: t.teacher.certificate_url,
		specialization: t.teacher.specialization,
	}));

	const department = {
		name: course?.department.name,
		department_description: course?.department.department_description,
		department_established_year: course?.department.department_established_year,
		code: course?.department.code,
	};

	return {
		teachers: structuredTeachers,
		department,
		...rest,
	};
};

export const CourseService = {
	createCourse,
	updateCourseDetails,
	createNewCourseDetails,
	updateCourseStatus,
	assignCourseTeacher,
	getCourses,
	getAdminCourseDetails,
	getCourseDetails,
};
