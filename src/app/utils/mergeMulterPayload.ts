import type { NextFunction, Request, Response } from "express";
import type { TMulterFile } from "../lib/multer";

const mergeMulterPayload = (...fields: string[]) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		// parse the data from body.data
		if (req.body.data) {
			try {
				const parsedData = JSON.parse(req.body.data);
				req.body = { ...req.body, ...parsedData };
				delete req.body.data;
			} catch (_) {
				return res
					.status(400)
					.json({ message: "Invalid JSON format in body data" });
			}
		}

		if (req.files) {
			const files = req.files as { [fieldname: string]: TMulterFile[] };

			fields.forEach((field) => {
				if (files[field]) {
					req.body[field] =
						files[field].length === 1 ? files[field][0] : files[field];
				} else {
					req.body[field] = null;
				}
			});
		}

		if (req.file) {
			const fieldName = fields[0] as string;
			req.body[fieldName] = req.file;
		}

		next();
	};
};

export default mergeMulterPayload;
