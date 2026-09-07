import status from "http-status";
import type Stripe from "stripe";
import { prisma } from "../lib/prisma";
import AppError from "./appError";

export const handlePaymentSuccess = async (
	session: Stripe.Checkout.Session,
) => {
	const transactionResult = await prisma.$transaction(async (tx) => {
		const metadata = session.metadata;

		if (
			!metadata?.student_id ||
			!metadata?.institution_id ||
			!metadata?.course_details_id
		) {
			throw new AppError(
				status.BAD_REQUEST,
				"Required payment metadata is missing",
			);
		}

		if (!session.amount_total || !session.currency) {
			throw new AppError(
				status.BAD_REQUEST,
				"Payment amount or currency is missing",
			);
		}

		const studentId = metadata.student_id;
		const institutionId = Number(metadata.institution_id);
		const courseDetailsId = Number(metadata.course_details_id);

		if (!Number.isInteger(courseDetailsId)) {
			throw new AppError(status.BAD_REQUEST, "Invalid course details ID");
		}
		if (!Number.isInteger(institutionId)) {
			throw new AppError(status.BAD_REQUEST, "Invalid Institution ID");
		}

		const transactionId = session.payment_intent?.toString() ?? session.id;

		await tx.payment.create({
			data: {
				student_id: studentId,
				course_details_id: courseDetailsId,
				amount: session.amount_total / 100,
				institution_id: institutionId,
				transaction_id: transactionId,
				status: "SUCCESS",
				gateway_response: JSON.stringify(session),
			},
		});

		await tx.studentEnrollment.create({
			data: {
				student_id: studentId,
				course_details_id: courseDetailsId,
			},
		});
	});

	return transactionResult;
};

export const handlePaymentExpire = async (session: Stripe.Checkout.Session) => {
	const metadata = session.metadata;

	if (
		!metadata?.student_id ||
		!metadata?.institution_id ||
		!metadata?.course_details_id
	) {
		throw new AppError(
			status.BAD_REQUEST,
			"Required payment metadata is missing",
		);
	}

	if (!session.amount_total || !session.currency) {
		throw new AppError(
			status.BAD_REQUEST,
			"Payment amount or currency is missing",
		);
	}

	const transactionId = session.payment_intent?.toString() ?? session.id;
	const courseDetailsId = Number(metadata.course_details_id);
	const studentId = metadata.student_id;
	const institutionId = Number(metadata.institution_id);

	await prisma.payment.create({
		data: {
			student_id: studentId,
			course_details_id: courseDetailsId,
			amount: session.amount_total / 100,
			institution_id: institutionId,
			transaction_id: transactionId,
			status: "FAILED",
			gateway_response: JSON.stringify(session),
		},
	});
};
