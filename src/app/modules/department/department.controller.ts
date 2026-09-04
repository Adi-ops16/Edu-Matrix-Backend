import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { DepartmentService } from "./department.service";

const createDepartment = catchAsync(async (req, res) => {
	const payload = req.body;
	const userId = req.user?.id as string;

	const result = await DepartmentService.createDepartment(payload, userId);

	sendResponse(res, {
		status: status.CREATED,
		message: "Department created",
		data: result,
	});
});

const updatedDepartment = catchAsync(async (req, res) => {
	const payload = req.body;

	const result = await DepartmentService.updateDepartment(payload);

	sendResponse(res, {
		message: "Department updated",
		data: result,
	});
});

const getInstitutionDepartments = catchAsync(async (req, res) => {
	const institution_id = req.user?.institution_id ?? null;

	const result =
		await DepartmentService.getInstitutionDepartments(institution_id);

	sendResponse(res, {
		message: "Department updated",
		data: result,
	});
});

const deleteDepartment = catchAsync(async (req, res) => {
	const department_id: string = req.body;

	await DepartmentService.deleteDepartment(department_id);

	sendResponse(res, {
		message: "Department deleted",
	});
});
const joinDepartment = catchAsync(async (req, res) => {
	const department_id: string = req.body;
	const userId = req.user?.id ?? null;

	const result = await DepartmentService.joinDepartment(department_id, userId);

	sendResponse(res, {
		message: `Joined to ${result} department as a ${result}`,
		data: result,
	});
});

export const DepartmentController = {
	createDepartment,
	updatedDepartment,
	getInstitutionDepartments,
	deleteDepartment,
	joinDepartment,
};
