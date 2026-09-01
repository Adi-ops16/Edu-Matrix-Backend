/** biome-ignore-all lint/style/noNonNullAssertion: <for env config> */
import path from "node:path";
import process, { env } from "node:process";
import dotenv from "dotenv";

const envPath = path.join(process.cwd(), "/.env");
dotenv.config({ path: envPath, quiet: true });

export default {
	environment: env.ENVIRONMENT,
	port: env.PORT,
	frontend_url: env.FRONTEND_URL,
	database_url: env.DATABASE_URL!,
	bcrypt_salt_rounds: env.BCRYPT_SALT_ROUNDS!,

	// JWT credentials
	jwt_access_secret: env.JWT_ACCESS_SECRET!,
	jwt_access_time: env.JWT_ACCESS_TIME!,
	jwt_refresh_secret: env.JWT_REFRESH_SECRET!,
	jwt_refresh_time: env.JWT_REFRESH_TIME!,

	// cloudinary credentials
	cloudinary_cloud_name: env.CLOUDINARY_CLOUD_NAME!,
	cloudinary_api_key: env.CLOUDINARY_API_KEY!,
	cloudinary_api_secret: env.CLOUDINARY_API_SECRET!,

	// redis credentials
	redis_username: env.REDIS_USERNAME!,
	redis_password: env.REDIS_PASSWORD!,
	redis_host: env.REDIS_HOST!,
	redis_port: env.REDIS_PORT!,

	// Google/nodemailer credentials
	email_sender: env.EMAIL_SENDER!,
	google_client_id: env.GOOGLE_CLIENT_ID!,
	google_client_cb_url: env.GOOGLE_CLIENT_CB_URL!,
	google_client_secret: env.GOOGLE_CLIENT_SECRET!,
	google_refresh_token: env.GOOGLE_REFRESH_TOKEN!,
};
