import status from "http-status";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../types";
import AppError from "../../utils/appError";
import type {
	TCreateInstitutionPayload,
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

export const InstitutionService = {
	createInstitution,
	updateInstitutionStatus,
};
