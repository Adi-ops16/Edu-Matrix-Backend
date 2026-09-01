import { Router } from "express";
import passport from "passport";
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

router.get(
	"/google",
	passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get("/google/callback", AuthController.googleCallback);

export const AuthRoutes = router;
