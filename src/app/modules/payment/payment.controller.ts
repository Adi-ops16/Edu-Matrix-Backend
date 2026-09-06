import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

const createCoursePayment = catchAsync(async (req, res) => {
	sendResponse(res, {
		message: "Payment created successfully",
	});
});
export const PaymentController = { createCoursePayment };
