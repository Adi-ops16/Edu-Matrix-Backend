import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { DepartmentController } from "./department.controller";
import { createDepartmentSchema } from "./department.schema";

const router = Router();

router.post(
	"/create",
	auth("INSTITUTION_ADMIN"),
	validateRequest(createDepartmentSchema),
	DepartmentController.createDepartment,
);

export const DepartmentRoutes = router;
