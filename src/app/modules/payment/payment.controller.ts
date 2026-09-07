import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";

const createCoursePayment = catchAsync(async (req, res) => {
	const payload = req.body;
	const student = req.user as Express.User;

	const result = await PaymentService.createCoursePayment(payload, student);

	sendResponse(res, {
		message: "Payment created successfully",
		data: {
			stripe_checkout_url: result,
		},
	});
});

const handleStripeWebhook = catchAsync(async (req, res) => {
	const event = req.body as Buffer;
	const signature = req.headers["stripe-signature"] as string;

	await PaymentService.handleStripeWebhook(event, signature);

	sendResponse(res, {
		message: "Webhook called successful",
	});
});

const getMyPayments = catchAsync(async (req, res) => {
	const student_id = req.user?.id as string | null;
	const institution_id = req.user?.institution_id as number | null;
	const result = await PaymentService.getMyPayments(student_id, institution_id);

	sendResponse(res, {
		message: "Payment data retrieved",
		data: result,
	});
});
export const PaymentController = {
	getMyPayments,
	createCoursePayment,
	handleStripeWebhook,
};
