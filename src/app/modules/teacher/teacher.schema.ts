import z from "zod";
import { Gender } from "../../../../generated/prisma/enums";
import { multerFileSchema } from "../../lib/multer";

export const updateTeacherProfileSchema = z.object({
	designation: z.string("Designation must be a string").optional(),
	degree: z.string("Degree must be a string").optional(),
	specialization: z.string("Specialization must be a string").optional(),
	graduated_from: z.string("Graduated from must be a string").optional(),
	graduation_year: z
		.number("Graduation year should be a number")
		.int("Graduation year must be an integer")
		.positive("Graduation year must be a positive number")
		.optional(),
	date_of_birth: z.coerce
		.date("Invalid date format for date of birth")
		.optional(),
	gender: z
		.enum([Gender.FEMALE, Gender.MALE, Gender.KINDER, Gender.OTHER])
		.optional(),
	phone: z
		.string("Phone must be text")
		.min(5, "Phone number is too short")
		.max(15, "Phone number is too long")
		.optional(),

	address: z.string("Address must be text").optional(),
	bio: z.string("Bio must be a string").optional(),
	joining_year: z
		.number("Joining year should be a number")
		.int("Joining year must be an integer")
		.positive("Joining year must be a positive number")
		.optional(),

	certificate: multerFileSchema.optional(),
});

export type TUpdateTeacherProfilePayload = z.infer<
	typeof updateTeacherProfileSchema
>;
