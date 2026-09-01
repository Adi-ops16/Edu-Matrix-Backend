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

const app: Application = express();

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

app.get("/", async (_: Request, res: Response) => {
	res.status(200).json({
		success: true,
		message: "Server is running",
	});
});

app.use(errorHandler);
app.use(notFound);

export default app;
