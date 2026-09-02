import z from "zod";
import { InstitutionStatus } from "../../../../generated/prisma/enums";

export const createInstitutionSchema = z.object({
	name: z
		.string("name is required")
		.min(2, "name must be at least 2 characters")
		.max(255, "name must be at most 255 characters"),

	code: z
		.string("code is required")
		.min(1, "code is required")
		.max(50, "code must be at most 50 characters")
		.regex(
			/^[A-Za-z0-9_-]+$/,
			"code can only contain letters, numbers, underscores and hyphens",
		),

	description: z
		.string("description is required")
		.min(10, "description must be at least 10 characters")
		.max(1000, "description must be at most 1000 characters"),

	established_year: z
		.number("established year is required")
		.int("established year must be an integer")
		.min(1000, "established year must be valid")
		.max(new Date().getFullYear(), "established year cannot be in the future"),

	website: z.url("website must be a valid URL").optional(),

	address: z
		.string("address is required")
		.min(5, "address must be at least 5 characters")
		.max(255, "address must be at most 255 characters"),

	city: z
		.string("city is required")
		.min(2, "city must be at least 2 characters")
		.max(15, "city must be at most 15 characters"),

	contact_email: z.email("contact email must be a valid email"),

	contact_number: z
		.string("contact number is required")
		.min(7, "contact number must be at least 7 characters")
		.max(20, "contact number must be at most 20 characters"),
});

export const updatedInstitutionSchema = z.object({
	institution_id: z
		.number("Invalid id: institution_id must be a number")
		.int("institution_id must be an integer"),
	status: z.enum(
		[InstitutionStatus.APPROVED, InstitutionStatus.REJECTED],
		"invalid enum: status must be a valid enum",
	),
});

export type TCreateInstitutionPayload = z.infer<typeof createInstitutionSchema>;
export type TUpdateInstitutionStatusPayload = z.infer<
	typeof updatedInstitutionSchema
>;
