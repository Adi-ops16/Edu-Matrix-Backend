import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CourseController } from "./course.controller";
import {
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

export const CourseRoutes = router;
