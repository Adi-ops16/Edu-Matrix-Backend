import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/appError";
import type { TCreateDepartmentPayload } from "./department.schema";

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

export const DepartmentService = {
	createDepartment,
};
