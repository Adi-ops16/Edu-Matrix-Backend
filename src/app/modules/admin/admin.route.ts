import { Router } from "express";
import auth from "../../middlewares/auth";
import { AdminController } from "./admin.controller";

const router = Router();

router.get(
	"/overview",
	auth("SUPER_ADMIN"),
	AdminController.getPlatformOverview,
);

export const AdminRoutes = router;
