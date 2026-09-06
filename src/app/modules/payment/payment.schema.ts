import z from "zod";

export const createCoursePaymentSchema = z.object({});

export type TCreateCoursePaymentPayload = z.infer<
	typeof createCoursePaymentSchema
>;
