import { Router } from "express";
import upload from "../../lib/multer";
import validateRequest from "../../middlewares/validateRequest";
import mergeMulterPayload from "../../utils/mergeMulterPayload";
import { AuthController } from "./auth.controller";
import { registerSchema, verifyOtpSchema } from "./auth.schema";

const router = Router();

router.post(
	"/register",
	upload.single("photo"),
	mergeMulterPayload("photo"),
	validateRequest(registerSchema),
	AuthController.registerUser,
);

router.post(
	"/verify-email",
	validateRequest(verifyOtpSchema),
	AuthController.verifyEmail,
);

export const AuthRoutes = router;
