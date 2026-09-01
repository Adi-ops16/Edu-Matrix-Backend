import z from "zod";
import { multerFileSchema } from "../../lib/multer";

export const registerSchema = z.object(
	{
		name: z.string("Name is required"),
		email: z.email("Invalid email format"),
		password: z
			.string("Password is required")
			.min(8, "Password must be at least 8 characters long")
			.regex(/[a-z]/, "Password must contain at least one lowercase letter")
			.regex(/[A-Z]/, "Password must contain at least one uppercase letter"),
		photo: multerFileSchema.optional(),
	},
	"Please provide a valid object",
);

export const verifyOtpSchema = z.object({
	email: z.email("Invalid email format"),
	otp: z.string("OTP is required").length(6, "OTP must be 6 digits"),
});

export type TRegisterPayload = z.infer<typeof registerSchema>;
export type TVerifyOtpPayload = z.infer<typeof verifyOtpSchema>;
