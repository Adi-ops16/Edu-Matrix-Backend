import { Router } from "express";
import auth from "../../middlewares/auth";
import { PaymentController } from "./payment.controller";

const router = Router();

router.post("/create", auth("STUDENT"), PaymentController.createCoursePayment);

export const PaymentRoutes = router;
