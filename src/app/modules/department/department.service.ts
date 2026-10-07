import status from "http-status";
import type { Role } from "../../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/appError";
import { removeUndefined } from "../../utils/removeUndefined";
import type {
	TApproveJoiningPayload,
	TCreateDepartmentPayload,
	TUpdateDepartmentPayload,
} from "./department.schema";

const createDepartment = async (
	payload: TCreateDepartmentPayload,
	userId: string,
) => {
	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
	});

	if (!user) {
		throw new AppError(status.NOT_FOUND, "User not found");
	}

	if (!user.institution_id) {
		throw new AppError(status.NOT_FOUND, "User has not joined an institution");
	}

	const department = await prisma.department.create({
		data: {
			...payload,
			institution_id: user.institution_id,
		},
		include: {
			institution: {
				select: {
					name: true,
					code: true,
					address: true,
					city: true,
					contact_email: true,
				},
			},
		},
	});

	return department;
};

const updateDepartment = async (payload: TUpdateDepartmentPayload) => {
	const { department_id, ...data } = payload;
	const updatedPayload = removeUndefined(data);

	const updatedDepartment = await prisma.department.update({
		where: {
			id: payload.department_id,
			is_deleted: false,
		},
		data: {
			...updatedPayload,
		},
	});

	return updatedDepartment;
};

const getInstitutionDepartments = async (
	institution_id: number | null,
	user_id: string,
	role: Role | null,
) => {
	if (!institution_id || !role) {
		throw new AppError(
			status.BAD_REQUEST,
			"User doesn't belong to any institution",
		);
	}

	const departments = await prisma.department.findMany({
		where: { institution_id, is_deleted: false },
	});

	if (role === "STUDENT") {
		const myDepartmentsIds = await prisma.studentDepartment.findMany({
			where: {
				student_id: user_id,
			},
			select: {
				department_id: true,
			},
		});

		return {
			departments,
			myDepartmentsIds: myDepartmentsIds.map((d) => d.department_id),
		};
	}

	if (role === "TEACHER") {
		const myDepartmentsIds = await prisma.teacherDepartment.findMany({
			where: {
				teacher_id: user_id,
			},
			select: {
				department_id: true,
			},
		});
		return {
			departments,
			myDepartmentsIds: myDepartmentsIds.map((d) => d.department_id),
		};
	}

	return { departments };
};

const deleteDepartment = async (department_id: string) => {
	await prisma.department.update({
		where: { id: department_id },
		data: { is_deleted: true },
	});
};

const joinDepartment = async (department_id: string, userId: string | null) => {
	if (!userId) {
		throw new AppError(status.BAD_REQUEST, "User_id is missing");
	}

	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
	});

	if (!user) {
		throw new AppError(status.NOT_FOUND, "User not found");
	}

	if (!user.institution_id) {
		throw new AppError(
			status.BAD_REQUEST,
			"User doesn't belong to any institution",
		);
	}

	const department = await prisma.department.findFirst({
		where: {
			id: department_id,
			institution_id: user.institution_id,
			is_deleted: false,
		},
	});

	if (!department) {
		throw new AppError(status.NOT_FOUND, "Department not found");
	}

	if (user.role === "STUDENT") {
		const existingMembership = await prisma.studentDepartment.findUnique({
			where: {
				student_id_department_id: {
					student_id: userId,
					department_id,
				},
			},
		});

		if (existingMembership) {
			if (existingMembership.joining_status === "APPROVED") {
				throw new AppError(
					status.CONFLICT,
					"Student has already joined this department",
				);
			}

			if (existingMembership.joining_status === "PENDING") {
				throw new AppError(
					status.CONFLICT,
					"Department joining request is already pending",
				);
			}

			// If rejected, allow the student to request again
			return await prisma.studentDepartment.update({
				where: {
					student_id_department_id: {
						student_id: userId,
						department_id,
					},
				},
				data: {
					joining_status: "PENDING",
				},
				include: {
					department: true,
				},
			});
		}

		return await prisma.studentDepartment.create({
			data: {
				student_id: userId,
				department_id,
			},
			include: {
				department: true,
			},
		});
	}

	if (user.role === "TEACHER") {
		const existingMembership = await prisma.teacherDepartment.findUnique({
			where: {
				teacher_id_department_id: {
					teacher_id: userId,
					department_id,
				},
			},
		});

		if (existingMembership) {
			if (existingMembership.joining_status === "APPROVED") {
				throw new AppError(
					status.CONFLICT,
					"Teacher has already joined this department",
				);
			}

			if (existingMembership.joining_status === "PENDING") {
				throw new AppError(
					status.CONFLICT,
					"Department joining request is already pending",
				);
			}

			return await prisma.teacherDepartment.update({
				where: {
					teacher_id_department_id: {
						teacher_id: userId,
						department_id,
					},
				},
				data: {
					joining_status: "PENDING",
				},
				include: {
					department: true,
				},
			});
		}

		return await prisma.teacherDepartment.create({
			data: {
				teacher_id: userId,
				department_id,
			},
			include: {
				department: true,
			},
		});
	}

	throw new AppError(status.BAD_REQUEST, "Invalid user role");
};

const getJoiningRequests = async (
	admin: Express.User,
	department_id: string | null,
) => {
	if (!department_id) {
		throw new AppError(
			status.BAD_REQUEST,
			"Department id is missing in query params",
		);
	}

	if (!admin.institution_id) {
		throw new AppError(
			status.BAD_REQUEST,
			"You are not associated with any institution",
		);
	}

	const teachers = await prisma.teacherDepartment.findMany({
		where: {
			department_id,
			joining_status: "PENDING",
			department: {
				institution_id: admin.institution_id,
			},
		},
		select: {
			teacher: {
				select: {
					date_of_birth: true,
					address: true,
					gender: true,
					user: {
						select: {
							id: true,
							name: true,
							role: true,
							profile_url: true,
						},
					},
				},
			},
		},
	});

	const students = await prisma.studentDepartment.findMany({
		where: {
			department_id,
			joining_status: "PENDING",
		},
		select: {
			student: {
				select: {
					date_of_birth: true,
					address: true,
					gender: true,
					user: {
						select: {
							id: true,
							name: true,
							role: true,
							profile_url: true,
						},
					},
				},
			},
		},
	});

	const structuredStudents = students.map((student) => ({
		id: student.student.user.id,
		name: student.student.user.name,
		role: student.student.user.role,
		gender: student.student.gender,
		profile_url: student.student.user.profile_url,
		date_of_birth: student.student.date_of_birth,
		address: student.student.address,
	}));

	const structuredTeachers = teachers.map((teacher) => ({
		id: teacher.teacher.user.id,
		name: teacher.teacher.user.name,
		role: teacher.teacher.user.role,
		gender: teacher.teacher.gender,
		profile_url: teacher.teacher.user.profile_url,
		date_of_birth: teacher.teacher.date_of_birth,
		address: teacher.teacher.address,
	}));

	return {
		students: structuredStudents,
		teachers: structuredTeachers,
	};
};

const approveJoining = async (
	payload: TApproveJoiningPayload,
	admin_user_id: string | null,
) => {
	if (!admin_user_id) {
		throw new AppError(status.BAD_REQUEST, "Admin user id not provided");
	}

	const { department_id, role, status: joining_status, user_id } = payload;

	if (role === "STUDENT") {
		const isDepartmentExists = await prisma.studentDepartment.findFirst({
			where: {
				department_id,
				student_id: user_id,
				joining_status: "PENDING",
			},
			include: {
				department: true,
			},
		});

		if (!isDepartmentExists || isDepartmentExists.department.is_deleted) {
			throw new AppError(status.NOT_FOUND, "Department not found");
		}

		return await prisma.studentDepartment.update({
			where: {
				student_id_department_id: {
					department_id,
					student_id: user_id,
				},
			},
			data: {
				joining_status,
				reviewed_by: admin_user_id,
			},
		});
	}

	if (role === "TEACHER") {
		const isDepartmentExists = await prisma.teacherDepartment.findFirst({
			where: {
				department_id,
				teacher_id: user_id,
				joining_status: "PENDING",
			},
			include: {
				department: true,
			},
		});

		if (!isDepartmentExists || isDepartmentExists.department?.is_deleted) {
			throw new AppError(status.NOT_FOUND, "Department not found");
		}

		return await prisma.teacherDepartment.update({
			where: {
				teacher_id_department_id: {
					department_id,
					teacher_id: user_id,
				},
			},
			data: {
				joining_status,
				reviewed_by: admin_user_id,
			},
		});
	}
};

export const DepartmentService = {
	createDepartment,
	updateDepartment,
	getInstitutionDepartments,
	deleteDepartment,
	joinDepartment,
	getJoiningRequests,
	approveJoining,
};
