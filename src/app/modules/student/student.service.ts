import status from "http-status";
import type {
	StudentDepartmentWhereInput,
	UserWhereInput,
} from "../../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import type { IQuery } from "../../types";
import AppError from "../../utils/appError";
import { removeUndefined } from "../../utils/removeUndefined";
import type { TUpdateStudentProfilePayload } from "./student.schema";

const updateStudentProfile = async (
	payload: TUpdateStudentProfilePayload,
	user_id: string | null,
) => {
	if (!user_id) {
		throw new AppError(status.BAD_REQUEST, "No user id provided");
	}

	const updatedPayload = removeUndefined(payload);

	const updatedStudent = await prisma.student.update({
		where: { student_id: user_id },
		data: {
			...updatedPayload,
		},
	});

	return updatedStudent;
};

const getInstitutionStudents = async (admin: Express.User, query: IQuery) => {
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
			role: "STUDENT",
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

	const students = await prisma.user.findMany({
		where: { AND: andConditions },
		select: {
			name: true,
			email: true,
			profile_url: true,
			student: true,
		},
		skip,
		take: limit,
	});
	const total = await prisma.user.count({ where: { AND: andConditions } });

	const meta = {
		page,
		limit,
		dataCount: total,
		totalPages: Math.ceil(total / limit) || 1,
	};

	return {
		meta,
		data: students,
	};
};

const getDepartmentStudents = async (
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

	const orConditions: StudentDepartmentWhereInput[] = [];

	if (query.searchTerm) {
		orConditions.push({
			student: {
				user: {
					name: { contains: query.searchTerm, mode: "insensitive" },
				},
			},
		});
	}

	if (query.searchTerm) {
		orConditions.push({
			student: {
				user: {
					email: { contains: query.searchTerm, mode: "insensitive" },
				},
			},
		});
	}

	const andConditions: StudentDepartmentWhereInput[] = [
		{
			department_id,
			joining_status: "APPROVED",
			student: {
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

	const students = await prisma.studentDepartment.findMany({
		where: {
			AND: andConditions,
		},
		select: {
			student: {
				include: {
					user: {
						select: {
							name: true,
							email: true,
							profile_url: true,
						},
					},
				},
			},
		},
		skip,
		take: limit,
	});

	const structuredResults = students.map(({ student }) => {
		const { user, ...rest } = student;
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

export const StudentService = {
	updateStudentProfile,
	getInstitutionStudents,
	getDepartmentStudents,
};
