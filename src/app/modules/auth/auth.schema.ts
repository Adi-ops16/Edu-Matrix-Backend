import z from "zod";
import { multerFileSchema } from "../../lib/multer";

export const registerSchema = z.object(
	{
		name: z.string("Name is required"),
		email: z.email("Invalid email format"),
		password: z
			.string("password is required")
			.min(8, "password must be 8 characters long")
			.max(24, "password can't be more that 24 characters")
			.regex(/[a-z]/, "password should have one small letter")
			.regex(/[A-Z]/, "password should have one capital letter"),
		photo: multerFileSchema.optional(),
	},
	"Please provide a valid object",
);

export const verifyOtpSchema = z.object({
	email: z.email("Invalid email format"),
	otp: z.string("OTP is required").length(6, "OTP must be 6 digits"),
});

export const loginSchema = z.object({
	email: z.email("Invalid email format"),
	password: z
		.string("password is required")
		.min(8, "password must be 8 characters long")
		.max(24, "password can't be more that 24 characters")
		.regex(/[a-z]/, "password should have one small letter")
		.regex(/[A-Z]/, "password should have one capital letter"),
});

export type TRegisterPayload = z.infer<typeof registerSchema>;
export type TVerifyOtpPayload = z.infer<typeof verifyOtpSchema>;
export type TLoginPayload = z.infer<typeof loginSchema>;
