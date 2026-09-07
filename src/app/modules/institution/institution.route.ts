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

router.get(
	"/institution-applications",
	auth("SUPER_ADMIN"),
	InstitutionController.getInstitutionApplications,
);

router.patch(
	"/institution-application-review",
	auth("SUPER_ADMIN"),
	validateRequest(updatedInstitutionSchema),
	InstitutionController.updateInstitutionStatus,
);

router.post(
	"/apply-for-institution",
	auth(),
	validateRequest(applyForInstitutionSchema),
	InstitutionController.applyForInstitution,
);

router.get(
	"/joining-applications",
	auth("INSTITUTION_ADMIN"),
	InstitutionController.getPendingApplications,
);

router.patch(
	"/joining-application-review",
	auth("INSTITUTION_ADMIN"),
	validateRequest(reviewApplicationSchema),
	InstitutionController.reviewApplication,
);

export const InstitutionRoutes = router;
