import z from "zod";

export const updateUserProfileSchema = z.object({
	name: z.string("Name must be string").optional(),
});

export type TUpdateUserProfilePayload = z.infer<typeof updateUserProfileSchema>;
