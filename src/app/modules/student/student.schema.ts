import z from "zod";
import { Gender } from "../../../../generated/prisma/enums";

export const updateStudentProfileSchema = z.object({
	admission_year: z
		.number("Admission year should be a number")
		.int("Admission year must be an integer")
		.positive("Admission year must be a positive number")
		.optional(),

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
});

export type TUpdateStudentProfilePayload = z.infer<
	typeof updateStudentProfileSchema
>;
