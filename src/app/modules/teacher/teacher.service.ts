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
			certificate_url: certificateDetails?.secure_url ?? null,
			certificate_public_id: certificateDetails?.public_id ?? null,
		},
	});

	return updatedTeacher;
};

const getInstitutionTeachers = async (admin: Express.User) => {
	if (!admin.institution_id) {
		throw new AppError(
			status.BAD_REQUEST,
			"Admin doesn't belong to any institution",
		);
	}

	const teacher = await prisma.teacher.findMany({
		where: {
			user: {
				institution_id: admin.institution_id,
				is_active: true,
				is_deleted: false,
				user_status: "ACTIVE",
				member_status: "APPROVED",
				is_verified: true,
			},
		},
		include: {
			user: {
				select: {
					name: true,
					email: true,
					profile_url: true,
				},
			},
		},
	});

	return teacher;
};

export const TeacherService = { updateTeacherProfile, getInstitutionTeachers };
