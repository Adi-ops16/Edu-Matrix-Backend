import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import passport from "passport";
import config from "./app/config";
import errorHandler from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";
import { AuthRoutes } from "./app/modules/auth/auth.route";
import "./app/config/passport";
import { CourseRoutes } from "./app/modules/course/course.route";
import { DepartmentRoutes } from "./app/modules/department/department.route";
import { InstitutionRoutes } from "./app/modules/institution/institution.route";
import { PaymentRoutes } from "./app/modules/payment/payment.route";
import { StudentRoutes } from "./app/modules/student/student.route";
import { TeacherRoutes } from "./app/modules/teacher/teacher.route";

const app: Application = express();

app.use("/api/v1/payment/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: config.frontend_url,
		credentials: true,
	}),
);
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/student", StudentRoutes);
app.use("/api/v1/teacher", TeacherRoutes);
app.use("/api/v1/institution", InstitutionRoutes);
app.use("/api/v1/department", DepartmentRoutes);
app.use("/api/v1/course", CourseRoutes);
app.use("/api/v1/payment", PaymentRoutes);

app.get("/", async (_: Request, res: Response) => {
	res.status(200).json({
		success: true,
		message: "Server is running",
	});
});

app.use(errorHandler);
app.use(notFound);

export default app;
