import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { InstitutionController } from "./institution.controller";
import {
	createInstitutionSchema,
	updatedInstitutionSchema,
} from "./institution.schema";

const router = Router();

router.post(
	"/create",
	auth(),
	validateRequest(createInstitutionSchema),
	InstitutionController.createInstitution,
);

router.patch(
	"/status",
	auth("SUPER_ADMIN"),
	validateRequest(updatedInstitutionSchema),
	InstitutionController.updateInstitutionStatus,
);

export const InstitutionRoutes = router;
