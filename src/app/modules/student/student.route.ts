import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { StudentController } from "./student.controller";
import { createStudentProfileSchema } from "./student.schema";

const router = Router();

router.post(
	"/create",
	auth(),
	validateRequest(createStudentProfileSchema),
	StudentController.createStudentProfile,
);

export const StudentRoutes = router;
