import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { StudentController } from "./student.controller";
import { updateStudentProfileSchema } from "./student.schema";

const router = Router();

router.patch(
	"/profile-update",
	auth("STUDENT"),
	validateRequest(updateStudentProfileSchema),
	StudentController.updateStudentProfile,
);

export const StudentRoutes = router;
