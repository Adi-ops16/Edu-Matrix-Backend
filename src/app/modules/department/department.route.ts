import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { DepartmentController } from "./department.controller";
import {
	approveJoiningSchema,
	createDepartmentSchema,
	deleteDepartmentSchema,
	joinDepartmentSchema,
	updateDepartmentSchema,
} from "./department.schema";

const router = Router();

router.get(
	"/departments",
	auth("INSTITUTION_ADMIN", "STUDENT", "TEACHER"),
	DepartmentController.getInstitutionDepartments,
);

router.post(
	"/create",
	auth("INSTITUTION_ADMIN"),
	validateRequest(createDepartmentSchema),
	DepartmentController.createDepartment,
);

router.patch(
	"/update",
	auth("INSTITUTION_ADMIN"),
	validateRequest(updateDepartmentSchema),
	DepartmentController.updatedDepartment,
);

router.delete(
	"/delete",
	auth("INSTITUTION_ADMIN"),
	validateRequest(deleteDepartmentSchema),
	DepartmentController.deleteDepartment,
);

router.post(
	"/join",
	auth("STUDENT", "TEACHER"),
	validateRequest(joinDepartmentSchema),
	DepartmentController.joinDepartment,
);

router.patch(
	"/review-request",
	auth("INSTITUTION_ADMIN"),
	validateRequest(approveJoiningSchema),
	DepartmentController.approveJoining,
);

export const DepartmentRoutes = router;
