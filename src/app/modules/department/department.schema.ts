import z from "zod";

export const createDepartmentSchema = z.object({
	name: z.string("Name is required"),
	code: z
		.string("code is required and must be a string")
		.max(5, "code must be less than 5 characters"),
	d_description: z.string("Description is required"),
	d_established_year: z
		.number("Year must be a number")
		.int("year must be an integer"),
});

export type TCreateDepartmentPayload = z.infer<typeof createDepartmentSchema>;
