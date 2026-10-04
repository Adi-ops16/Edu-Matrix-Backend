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

const getInstitutions = catchAsync(async (_req, res) => {
	const result = await InstitutionService.getInstitutions();

	sendResponse(res, {
		message: "Retrieved institutions",
		data: result,
	});
});

const getInstitutionApplications = catchAsync(async (_req, res) => {
	const result = await InstitutionService.getInstitutionApplications();

	sendResponse(res, {
		message: "Retrieved institution applications",
		data: result,
	});
});

const getInstitutionTeachers = catchAsync(async (req, res) => {
	const admin = req.user as Express.User;
	const query = req.query;
	const result = await InstitutionService.getInstitutionTeachers(admin, query);

	sendResponse(res, {
		message: "Institution Teachers fetched successfully",
		data: result.data,
		meta: result.meta,
	});
});

const getInstitutionStudents = catchAsync(async (req, res) => {
	const admin = req.user as Express.User;
	const query = req.query;
	const result = await InstitutionService.getInstitutionStudents(admin, query);

	sendResponse(res, {
		message: "Institution Students fetched successfully",
		data: result.data,
		meta: result.meta,
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

const applyForInstitution = catchAsync(async (req, res) => {
	const payload = req.body;
	const user_id = req.user?.id ?? null;

	const result = await InstitutionService.applyForInstitution(payload, user_id);

	sendResponse(res, {
		status: status.OK,
		message: `Application received, wait for approval`,
		data: result,
	});
});

const getPendingApplications = catchAsync(async (_req, res) => {
	const result = await InstitutionService.getPendingApplications();

	sendResponse(res, {
		message: `Pending Applications retrieved`,
		data: result,
	});
});

const reviewApplication = catchAsync(async (req, res) => {
	const admin_id = req.user?.id ?? null;
	const payload = req.body;
	const result = await InstitutionService.reviewApplication(payload, admin_id);

	sendResponse(res, {
		message: `Application ${result.member_status.toLowerCase()}`,
		data: result,
	});
});

export const InstitutionController = {
	createInstitution,
	getInstitutions,
	getInstitutionApplications,
	getInstitutionStudents,
	getInstitutionTeachers,
	updateInstitutionStatus,
	applyForInstitution,
	getPendingApplications,
	reviewApplication,
};
