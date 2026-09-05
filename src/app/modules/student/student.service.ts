import status from "http-status";
import { prisma } from "../../lib/prisma";
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

export const StudentService = { updateStudentProfile };
