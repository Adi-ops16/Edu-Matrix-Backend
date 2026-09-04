import z from "zod";
import { JoiningStatus, Role } from "../../../../generated/prisma/enums";

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

export const updateDepartmentSchema = z.object({
	department_id: z.uuid("Invalid uuid"),
	name: z.string("Name is required").optional(),
	code: z
		.string("code is required and must be a string")
		.max(5, "code must be less than 5 characters")
		.optional(),
	d_description: z.string("Description is required").optional(),
	d_established_year: z
		.number("Year must be a number")
		.int("year must be an integer")
		.optional(),
});

export const deleteDepartmentSchema = z.object({
	department_id: z.uuid("Invalid uuid"),
});

export const joinDepartmentSchema = deleteDepartmentSchema;

export const approveJoiningSchema = z.object({
	department_id: z.uuid("Invalid uuid"),
	user_id: z.uuid("Invalid uuid"),
	role: z.enum([Role.STUDENT, Role.TEACHER], "Invalid role"),
	status: z.enum([JoiningStatus.APPROVED, JoiningStatus.DECLINED]),
});

export type TCreateDepartmentPayload = z.infer<typeof createDepartmentSchema>;
export type TUpdateDepartmentPayload = z.infer<typeof updateDepartmentSchema>;
export type TApproveJoiningPayload = z.infer<typeof approveJoiningSchema>;
