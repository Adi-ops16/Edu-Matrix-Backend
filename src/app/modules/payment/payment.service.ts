import status from "http-status";
import type Stripe from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import stripe from "../../lib/stripe";
import AppError from "../../utils/appError";
import { handlePaymentExpire, handlePaymentSuccess } from "../../utils/payment";
import type { TCreateCoursePaymentPayload } from "./payment.schema";

const createCoursePayment = async (
	payload: TCreateCoursePaymentPayload,
	student: Express.User,
) => {
	if (!student.institution_id) {
		throw new AppError(
			status.BAD_REQUEST,
			"Student is not associated with an institution",
		);
	}

	const courseDetails = await prisma.courseDetails.findFirst({
		where: {
			id: payload.course_details_id,
			course: {
				department: {
					institution_id: student.institution_id,
				},
			},
		},
		include: {
			course: true,
		},
	});
	if (!courseDetails) {
		throw new AppError(
			status.NOT_FOUND,
			"Course offering not found or unavailable",
		);
	}

	if (!courseDetails?.price) {
		throw new AppError(status.CONFLICT, "Price is missing");
	}
	const price = Number(courseDetails?.price);
	if (!Number.isFinite(price) || price <= 0) {
		throw new AppError(status.BAD_REQUEST, "Course price is invalid");
	}

	const studentDepartment = await prisma.studentDepartment.findUnique({
		where: {
			student_id_department_id: {
				department_id: courseDetails?.course.department_id,
				student_id: student.id,
			},
		},
	});
	if (!studentDepartment) {
		throw new AppError(
			status.BAD_REQUEST,
			"Student doesn't belong to associated department",
		);
	}
	if (studentDepartment.joining_status !== "APPROVED") {
		throw new AppError(
			status.BAD_REQUEST,
			"You are not approved to this department yet, contact your institution admin",
		);
	}

	const existingSuccessfulPayment = await prisma.payment.findFirst({
		where: {
			student_id: student.id,
			course_details_id: courseDetails.id,
			status: "SUCCESS",
		},
	});

	if (existingSuccessfulPayment) {
		throw new AppError(status.CONFLICT, "Cannot purchase a course twice");
	}

	const session = await stripe.checkout.sessions.create({
		line_items: [
			{
				price_data: {
					currency: courseDetails.currency,
					product_data: {
						name: courseDetails.course.title,
						description: `Paying ${price} ${courseDetails.currency.toLocaleLowerCase()}`,
					},
					unit_amount: Math.round(price * 100),
				},
				quantity: 1,
			},
		],
		customer_email: student.email,
		mode: "payment",
		managed_payments: {
			enabled: false,
		},
		metadata: {
			student_id: student.id,
			institution_id: student.institution_id,
			course_details_id: courseDetails.id,
		},
		success_url: `${config.frontend_url}/student/payment/success`,
		cancel_url: `${config.frontend_url}/student/payment/cancel`,
	});

	return session.url;
};

const handleStripeWebhook = async (payload: Buffer, signature: string) => {
	const endpointSecret = config.stripe_webhook_secret;
	const event = stripe.webhooks.constructEvent(
		payload,
		signature,
		endpointSecret,
	);

	switch (event.type) {
		case "checkout.session.completed": {
			const session = event.data.object as Stripe.Checkout.Session;
			await handlePaymentSuccess(session);
			break;
		}

		case "checkout.session.expired": {
			const session = event.data.object as Stripe.Checkout.Session;
			await handlePaymentExpire(session);
			break;
		}
		default:
			// Unexpected event type
			console.log(`Unhandled event type ${event.type}.`);
			break;
	}
};

const getMyPayments = async (
	student_id: string | null,
	institution_id: number | null,
) => {
	if (!institution_id) {
		throw new AppError(
			status.BAD_REQUEST,
			"Student is not associated with any institution",
		);
	}
	if (!student_id) {
		throw new AppError(status.BAD_REQUEST, "Student id not provided");
	}
	const payments = await prisma.payment.findMany({
		where: {
			student_id,
			status: { in: ["SUCCESS", "REFUNDED"] },
		},
		include: {
			course_details: {
				select: {
					batch: true,
					semester: true,
					start_date: true,
					end_date: true,
					course: {
						select: {
							title: true,
						},
					},
				},
			},
		},
		omit: {
			gateway_response: true,
		},
		orderBy: { created_at: "desc" },
	});

	const structuredResult = payments.map((p) => {
		const { course_details, ...rest } = p;
		const result = {
			course: {
				title: course_details.course.title,
				batch: course_details.batch,
				semester: course_details.semester,
				start_date: course_details.start_date,
				end_date: course_details.end_date,
			},
			...rest,
		};
		return result;
	});

	return structuredResult;
};

export const PaymentService = {
	createCoursePayment,
	handleStripeWebhook,
	getMyPayments,
};
