import z from "zod";

export const createCoursePaymentSchema = z.object({
	course_details_id: z
		.number("Course details id should be a number")
		.int("Course details id must be an integer")
		.min(1, "Course details id must be provided"),
});

export type TCreateCoursePaymentPayload = z.infer<
	typeof createCoursePaymentSchema
>;
