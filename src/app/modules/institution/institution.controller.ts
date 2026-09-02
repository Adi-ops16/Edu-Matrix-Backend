import status from "http-status";
import type { RequestUser } from "../../types";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { InstitutionService } from "./institution.service";

const createInstitution = catchAsync(async (req, res) => {
	const user = req.user as RequestUser;
	const payload = req.body;
	const result = await InstitutionService.createInstitution(payload, user);

	sendResponse(res, {
		message: "Institution created, please wait for approval",
		data: result,
	});
});

const updateInstitutionStatus = catchAsync(async (req, res) => {
	const payload = req.body;
	const user = req.user as RequestUser;
	const result = await InstitutionService.updateInstitutionStatus(
		payload,
		user,
	);

	sendResponse(res, {
		status: status.OK,
		message: `Institution application has been ${result.status.toLowerCase()}`,
		data: result,
	});
});

export const InstitutionController = {
	createInstitution,
	updateInstitutionStatus,
};
