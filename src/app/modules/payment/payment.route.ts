import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentController } from "./payment.controller";
import { createCoursePaymentSchema } from "./payment.schema";

const router = Router();

router.post(
	"/create-stripe-checkout-session",
	auth("STUDENT"),
	validateRequest(createCoursePaymentSchema),
	PaymentController.createCoursePayment,
);

router.post("/webhook", PaymentController.handleStripeWebhook);

router.get("/", auth("STUDENT"), PaymentController.getMyPayments);

export const PaymentRoutes = router;
