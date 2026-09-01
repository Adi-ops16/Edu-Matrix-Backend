import multer from "multer";
import z from "zod";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export type TMulterFile = Express.Multer.File;

export const multerFileSchema = z.object({
	fieldname: z.string(),
	originalname: z.string(),
	encoding: z.string(),
	mimetype: z.string(),
	buffer: z.instanceof(Buffer),
	size: z.number(),
});
export default upload;
