import { z } from "zod";
import { CourseStatus } from "../../../../generated/prisma/enums";

const courseDetailsSchema = z.object({
	semester: z
		.string("Semester must be a string")
		.min(1, "Semester is required"),
	batch: z.string("Batch must be a string").min(1, "Batch is required"),

	start_date: z.coerce.date().optional(),
	end_date: z.coerce.date().optional(),

	price: z
		.number("Price should be a number")
		.min(0, "Price cannot be negative")
		.default(0),
	currency: z
		.string()
		.length(3, "Currency must be a 3-letter currency code")
		.transform((value) => value.toUpperCase()),
	status: z
		.enum(
			[CourseStatus.COMPLETED, CourseStatus.ONGOING, CourseStatus.UPCOMING],
			"Invalid status enum",
		)
		.default(CourseStatus.UPCOMING),
});

export const createCourseSchema = z.object({
	title: z.string().min(1, "Course title is required").max(200),

	code: z
		.string("code should be a string")
		.min(1, "Course code is required")
		.max(50),

	description: z.string().optional(),

	learning_outcomes: z
		.array(z.string().min(1))
		.min(1, "At least one learning outcome is required"),

	department_id: z.uuid("Invalid department ID"),

	course_details: courseDetailsSchema,
});

export const updateCourseDetailsSchema = z.object({
	course_details_id: z
		.number("course_details_id must be a number")
		.min(1, "Id must exists")
		.int("Id must be an integer"),
	start_date: z.coerce.date().optional(),
	end_date: z.coerce.date().optional(),

	price: z
		.number("Price should be a number")
		.min(0, "Price cannot be negative")
		.optional(),
	currency: z
		.string()
		.length(3, "Currency must be a 3-letter currency code")
		.transform((value) => value.toUpperCase())
		.optional(),
});

export const createNewCourseDetails = z.object({
	course_id: z.uuid("Invalid course id"),
	details: courseDetailsSchema,
});

export const updateCourseStatusSchema = z.object({
	course_details_id: z
		.number("course details id must be a number")
		.int("course details id must be an integer"),
	status: z.enum(
		[CourseStatus.ONGOING, CourseStatus.COMPLETED],
		"Invalid status enum",
	),
});

export type TCreateCoursePayload = z.infer<typeof createCourseSchema>;

export type TUpdateCourseDetailsPayload = z.infer<
	typeof updateCourseDetailsSchema
>;

export type TCreateNewCourseDetailsPayload = z.infer<
	typeof createNewCourseDetails
>;

export type TUpdateCourseStatusPayload = z.infer<
	typeof updateCourseStatusSchema
>;
