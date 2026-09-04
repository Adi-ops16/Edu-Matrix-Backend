import path from "node:path";
import ejs from "ejs";
import status from "http-status";
import config from "../../config";
import transporter from "../../lib/nodeMailer";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../types";
import AppError from "../../utils/appError";
import type {
	TApplyForInstitutionPayload,
	TCreateInstitutionPayload,
	TReviewApplicationPayload,
	TUpdateInstitutionStatusPayload,
} from "./institution.schema";

const createInstitution = async (
	payload: TCreateInstitutionPayload,
	user: RequestUser,
) => {
	const institution = await prisma.institution.create({
		data: {
			...payload,
			website: payload.website ?? null,
			created_by: user.id,
		},
	});
	return institution;
};

const updateInstitutionStatus = async (
	payload: TUpdateInstitutionStatusPayload,
	user: RequestUser,
) => {
	const { institution_id, status: institutionStatus } = payload;

	const transactionResult = await prisma.$transaction(async (tx) => {
		const institution = await tx.institution.findUnique({
			where: { id: institution_id },
		});

		if (institution?.status === "REJECTED") {
			throw new AppError(status.CONFLICT, "Institution has been rejected");
		}

		if (institution?.status === "APPROVED") {
			throw new AppError(status.CONFLICT, "Institution has been accepted");
		}

		const updatedInstitution = await tx.institution.update({
			where: { id: institution_id },
			data: {
				status: institutionStatus,
				reviewed_by: user.id,
			},
		});

		if (updatedInstitution.status === "REJECTED") {
			return updatedInstitution;
		}

		const institution_admin = await tx.user.update({
			where: { id: updatedInstitution.created_by },
			data: {
				role: "INSTITUTION_ADMIN",
				institution_id: updatedInstitution.id,
				member_status: "APPROVED",
			},
			select: {
				name: true,
				email: true,
				id: true,
			},
		});

		return {
			...updatedInstitution,
			institution_admin,
		};
	});

	return transactionResult;
};

const applyForInstitution = async (
	payload: TApplyForInstitutionPayload,
	user_id: string | null,
) => {
	if (!user_id) {
		throw new AppError(status.BAD_REQUEST, "User id not provided");
	}

	const { institution_id, role } = payload;

	if (role === "STUDENT") {
		const studentTransactionResult = await prisma.$transaction(async (tx) => {
			const updateUser = await tx.user.update({
				where: {
					id: user_id,
				},
				data: {
					institution_id,
					role,
					member_status: "PENDING",
				},
				omit: {
					password: true,
				},
			});

			const createStudentProfile = await tx.student.create({
				data: {
					student_id: user_id,
				},
			});

			return {
				user: updateUser,
				student: createStudentProfile,
			};
		});
		return studentTransactionResult;
	}

	if (role === "TEACHER") {
		const teacherTransactionResult = await prisma.$transaction(async (tx) => {
			const updateUser = await tx.user.update({
				where: {
					id: user_id,
				},
				data: {
					institution_id,
					role,
					member_status: "PENDING",
				},
				omit: {
					password: true,
				},
			});

			const createTeacherProfile = await tx.teacher.create({
				data: {
					teacher_id: user_id,
				},
			});

			return {
				user: updateUser,
				teacher: createTeacherProfile,
			};
		});
		return teacherTransactionResult;
	}

	throw new AppError(status.BAD_REQUEST, "Invalid role");
};

const getPendingApplications = async () => {
	const result = await prisma.user.findMany({
		where: {
			member_status: "PENDING",
		},
		omit: {
			password: true,
		},
	});

	return result;
};

const reviewApplication = async (
	payload: TReviewApplicationPayload,
	admin_id: string | null,
) => {
	if (admin_id === null) {
		throw new AppError(status.BAD_REQUEST, "Admin id not provided");
	}

	const admin = await prisma.user.findUnique({
		where: { id: admin_id },
		select: { role: true, institution_id: true },
	});

	const user = await prisma.user.findUnique({
		where: { id: payload.user_id },
		select: { institution_id: true },
	});

	if (admin?.institution_id !== user?.institution_id) {
		throw new AppError(
			status.FORBIDDEN,
			"You are not authorized to review this application",
		);
	}

	const updatedUser = await prisma.user.update({
		where: { id: payload.user_id },
		data: {
			member_status: payload.membership_status,
		},
		omit: {
			password: true,
		},
		include: {
			institution: true,
		},
	});

	// Email sending
	const filePath = path.join(
		process.cwd(),
		"/src/app/templates/institution-application-review.ejs",
	);
	const htmlData = {
		name: updatedUser.name,
		email: updatedUser.email,
		institutionName: updatedUser.institution?.name,
		role: updatedUser.role,
		membershipStatus: updatedUser.member_status,
	};
	const html = await ejs.renderFile(filePath, htmlData);

	await transporter.sendMail({
		from: config.email_sender,
		to: updatedUser.email,
		subject: "Application reviewed",
		html,
	});

	return updatedUser;
};

export const InstitutionService = {
	createInstitution,
	updateInstitutionStatus,
	applyForInstitution,
	getPendingApplications,
	reviewApplication,
};
