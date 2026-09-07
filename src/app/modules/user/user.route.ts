import { Router } from "express";
import upload from "../../lib/multer";
import auth from "../../middlewares/auth";
import { UserController } from "./user.controller";

const router = Router();

router.patch(
	"/update-profile-picture",
	auth(),
	upload.single("picture"),
	UserController.changePfP,
);

export const UserRoutes = router;
