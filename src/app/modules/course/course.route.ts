import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CourseController } from "./course.controller";
import {
	assignTeacherSchema,
	createCourseSchema,
	createNewCourseDetails,
	updateCourseDetailsSchema,
	updateCourseStatusSchema,
} from "./course.schema";

const router = Router();

router.post(
	"/create",
	auth("INSTITUTION_ADMIN"),
	validateRequest(createCourseSchema),
	CourseController.createCourse,
);

router.post(
	"/create-details",
	auth("INSTITUTION_ADMIN"),
	validateRequest(createNewCourseDetails),
	CourseController.createNewCourseDetails,
);

router.patch(
	"/update-details",
	auth("INSTITUTION_ADMIN"),
	validateRequest(updateCourseDetailsSchema),
	CourseController.updateCourseDetails,
);

router.patch(
	"/update-status",
	auth("INSTITUTION_ADMIN"),
	validateRequest(updateCourseStatusSchema),
	CourseController.updateCourseStatus,
);

router.patch(
	"/assign-teacher",
	auth("INSTITUTION_ADMIN"),
	validateRequest(assignTeacherSchema),
	CourseController.assignCourseTeacher,
);

export const CourseRoutes = router;
