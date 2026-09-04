import z from "zod";
import { Role } from "../../../../generated/prisma/enums";

export const createStudentProfileSchema = z.object({
	role: z.enum([Role.STUDENT]),
	institution_id: z
		.number("Institution id must be a number")
		.int("Institution id must be an integer"),
});

export type TCreateStudentProfilePayload = z.infer<
	typeof createStudentProfileSchema
>;
