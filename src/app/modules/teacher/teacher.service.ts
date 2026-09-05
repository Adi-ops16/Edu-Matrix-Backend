import status from "http-status";
import { prisma } from "../../lib/prisma";
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
			certificate: certificateDetails?.secure_url ?? null,
			certificate_public_id: certificateDetails?.public_id ?? null,
		},
	});

	return updatedTeacher;
};

export const TeacherService = { updateTeacherProfile };
