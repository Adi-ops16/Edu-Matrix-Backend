import status from "http-status";
import type {
	TeacherDepartmentWhereInput,
	TeacherWhereInput,
	UserWhereInput,
} from "../../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import type { IQuery } from "../../types";
import AppError from "../../utils/appError";
import { removeUndefined } from "../../utils/removeUndefined";
import uploadImage from "../../utils/uploadImage";
import type { TUpdateTeacherProfilePayload } from "./teacher.schema";

const updateTeacherProfile = async (
	payload: TUpdateTeacherProfilePayload,
	user_id: string | null,
) => {
	if (!user_id) {
		throw new AppError(status.BAD_REQUEST, "User id not provided");
	}

	const { certificate, ...profileData } = payload;

	const refinedPayload = removeUndefined(profileData);
	const certificateDetails = await uploadImage(payload.certificate?.buffer);

	const updatedTeacher = await prisma.teacher.update({
		where: { teacher_id: user_id },
		data: {
			...refinedPayload,
			certificate_url: certificateDetails?.secure_url ?? null,
			certificate_public_id: certificateDetails?.public_id ?? null,
		},
	});

	return updatedTeacher;
};

const getInstitutionTeachers = async (admin: Express.User, query: IQuery) => {
	let limit = 10;
	if (query.limit) {
		limit = Number(query.limit);
	}

	let page = 1;
	if (query.page) {
		page = Number(query.page);
	}
	const skip = (page - 1) * limit;

	const andConditions: UserWhereInput[] = [
		{
			institution_id: admin.institution_id,
			is_deleted: false,
			is_verified: true,
			is_active: true,
			member_status: "APPROVED",
			role: "TEACHER",
		},
	];

	if (query.name) {
		andConditions.push({
			name: {
				contains: query.name,
				mode: "insensitive",
			},
		});
	}

	if (query.email) {
		andConditions.push({
			email: {
				contains: query.email,
				mode: "insensitive",
			},
		});
	}

	const teachers = await prisma.user.findMany({
		where: {
			AND: andConditions,
		},
		select: {
			name: true,
			profile_url: true,
			email: true,
			teacher: {
				omit: {
					certificate_public_id: true,
					created_at: true,
					updated_at: true,
				},
			},
		},
		skip,
		take: limit,
	});
	const total = teachers.length;

	const meta = {
		page,
		limit,
		dataCount: total,
		totalPages: Math.ceil(total / limit) || 1,
	};

	return {
		meta,
		data: teachers,
	};
};

const getDepartmentTeachers = async (
	admin: Express.User,
	department_id: string | null,
	query: IQuery,
) => {
	if (!department_id) {
		throw new AppError(
			status.BAD_REQUEST,
			"department_id missing from query params",
		);
	}
	let limit = 10;
	if (query.limit) {
		limit = Number(query.limit);
	}

	let page = 1;
	if (query.page) {
		page = Number(query.page);
	}
	const skip = (page - 1) * limit;

	const orConditions: TeacherDepartmentWhereInput[] = [];

	if (query.searchTerm) {
		orConditions.push({
			teacher: {
				user: {
					name: { contains: query.searchTerm, mode: "insensitive" },
				},
			},
		});
	}

	if (query.searchTerm) {
		orConditions.push({
			teacher: {
				user: {
					email: { contains: query.searchTerm, mode: "insensitive" },
				},
			},
		});
	}

	const andConditions: TeacherDepartmentWhereInput[] = [
		{
			department_id,
			joining_status: "APPROVED",
			teacher: {
				user: {
					institution_id: admin.institution_id,
					is_deleted: false,
					is_verified: true,
					is_active: true,
					member_status: "APPROVED",
				},
			},
		},
		{
			OR: orConditions,
		},
	];

	const teachers = await prisma.teacherDepartment.findMany({
		where: {
			AND: andConditions,
		},
		select: {
			teacher: {
				include: {
					user: {
						select: {
							name: true,
							email: true,
							profile_url: true,
						},
					},
				},
				omit: {
					certificate_public_id: true,
					created_at: true,
					updated_at: true,
				},
			},
		},
		skip,
		take: limit,
	});

	const structuredResults = teachers.map(({ teacher }) => {
		const { user, ...rest } = teacher;
		return {
			...user,
			teacher: {
				...rest,
			},
		};
	});
	const total = structuredResults.length;

	const meta = {
		page,
		limit,
		dataCount: total,
		totalPages: Math.ceil(total / limit) || 1,
	};

	return {
		meta,
		data: structuredResults,
	};
};

const getTeachersToAssignToCourse = async (
	courseDetailsId: number | null,
	query: IQuery,
) => {
	if (!courseDetailsId) {
		throw new AppError(
			status.BAD_REQUEST,
			"Provide the course details id in query params",
		);
	}

	const orConditions: TeacherWhereInput[] = [];

	if (query.searchTerm) {
		orConditions.push({
			user: {
				name: {
					contains: query.searchTerm,
					mode: "insensitive",
				},
			},
		});
	}
	if (query.searchTerm) {
		orConditions.push({
			user: {
				email: {
					contains: query.searchTerm,
					mode: "insensitive",
				},
			},
		});
	}

	const teachers = await prisma.teacher.findMany({
		where: {
			courses: {
				none: {
					course_details_id: courseDetailsId,
				},
			},
			...(orConditions.length > 0 ? { OR: orConditions } : {}),
		},
		select: {
			degree: true,
			designation: true,
			specialization: true,
			teacher_id: true,
			user: {
				select: {
					name: true,
					profile_url: true,
					email: true,
				},
			},
		},
	});

	const structuredResult = teachers.map((t) => ({
		teacher_id: t.teacher_id,
		name: t.user.name,
		email: t.user.email,
		profile_url: t.user.profile_url,
		degree: t.degree,
		designation: t.designation,
		specialization: t.specialization,
	}));

	return structuredResult;
};

export const TeacherService = {
	updateTeacherProfile,
	getInstitutionTeachers,
	getTeachersToAssignToCourse,
	getDepartmentTeachers,
};
