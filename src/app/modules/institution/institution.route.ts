import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { InstitutionController } from "./institution.controller";
import {
	applyForInstitutionSchema,
	createInstitutionSchema,
	reviewApplicationSchema,
	updatedInstitutionSchema,
} from "./institution.schema";

const router = Router();

router.post(
	"/create-institution",
	auth(),
	validateRequest(createInstitutionSchema),
	InstitutionController.createInstitution,
);

router.patch(
	"/review",
	auth("SUPER_ADMIN"),
	validateRequest(updatedInstitutionSchema),
	InstitutionController.updateInstitutionStatus,
);

router.post(
	"/apply",
	auth(),
	validateRequest(applyForInstitutionSchema),
	InstitutionController.applyForInstitution,
);

router.get(
	"/applications",
	auth("INSTITUTION_ADMIN"),
	InstitutionController.getPendingApplications,
);

router.patch(
	"/application-review",
	auth("INSTITUTION_ADMIN"),
	validateRequest(reviewApplicationSchema),
	InstitutionController.reviewApplication,
);

export const InstitutionRoutes = router;
