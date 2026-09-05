import { Router } from "express";
import upload from "../../lib/multer";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import mergeMulterPayload from "../../utils/mergeMulterPayload";
import { TeacherController } from "./teacher.controller";
import { updateTeacherProfileSchema } from "./teacher.schema";

const router = Router();

router.patch(
	"/profile-update",
	auth("TEACHER"),
	upload.single("certificate"),
	mergeMulterPayload("certificate"),
	validateRequest(updateTeacherProfileSchema),
	TeacherController.updateTeacherProfile,
);

export const TeacherRoutes = router;
