import path from "node:path";
import ejs from "ejs";
import status from "http-status";
import type Stripe from "stripe";
import config from "../config";
import transporter, { brandLogoAttachment } from "../lib/nodeMailer";
import { prisma } from "../lib/prisma";
import AppError from "./appError";

export const handlePaymentSuccess = async (
	session: Stripe.Checkout.Session,
) => {
	const paymentReceipt = await prisma.$transaction(async (tx) => {
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

		const payment = await tx.payment.create({
			data: {
				student_id: studentId,
				course_details_id: courseDetailsId,
				amount: session.amount_total / 100,
				currency: session.currency.toUpperCase(),
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

		const [student, courseDetails] = await Promise.all([
			tx.user.findUnique({
				where: { id: studentId },
				select: { name: true, email: true },
			}),
			tx.courseDetails.findUnique({
				where: { id: courseDetailsId },
				select: {
					batch: true,
					semester: true,
					course: { select: { title: true } },
				},
			}),
		]);

		if (!student || !courseDetails) {
			throw new AppError(
				status.NOT_FOUND,
				"Student or course details not found for payment receipt",
			);
		}

		return {
			student,
			courseDetails,
			amount: payment.amount,
			currency: payment.currency,
			transactionId,
			paymentDate: payment.created_at,
		};
	});

	const filePath = path.join(
		process.cwd(),
		"src",
		"app",
		"templates",
		"payment-success.ejs",
	);
	const html = await ejs.renderFile(filePath, {
		name: paymentReceipt.student.name,
		courseTitle: paymentReceipt.courseDetails.course.title,
		batch: paymentReceipt.courseDetails.batch,
		semester: paymentReceipt.courseDetails.semester,
		amount: new Intl.NumberFormat("en", {
			style: "currency",
			currency: paymentReceipt.currency,
		}).format(paymentReceipt.amount),
		transactionId: paymentReceipt.transactionId,
		paymentDate: paymentReceipt.paymentDate.toLocaleString("en", {
			dateStyle: "long",
			timeStyle: "short",
		}),
	});

	await transporter.sendMail({
		from: config.email_sender,
		to: paymentReceipt.student.email,
		subject: `Payment confirmed: ${paymentReceipt.courseDetails.course.title}`,
		html,
		attachments: [brandLogoAttachment],
	});
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
			currency: session.currency.toUpperCase(),
			institution_id: institutionId,
			transaction_id: transactionId,
			status: "FAILED",
			gateway_response: JSON.stringify(session),
		},
	});
};
