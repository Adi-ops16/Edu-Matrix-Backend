import { prisma } from "../../lib/prisma";

const getPlatformOverview = async () => {
	const now = new Date();
	const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

	const [
		totalInstitutions,
		activeInstitutions,
		pendingInstitutions,
		totalStudents,
		totalTeachers,
		totalDepartments,
		totalCourses,
		activeCourseSections,
		totalEnrollments,
		totalRevenueResult,
		currentMonthRevenueResult,
		newInstitutionsThisMonth,
		newStudentsThisMonth,
	] = await Promise.all([
		// Institution Metrics
		prisma.institution.count(),
		prisma.institution.count({ where: { status: "APPROVED" } }),
		prisma.institution.count({ where: { status: "PENDING" } }),

		// User Profile Metrics
		prisma.student.count(),
		prisma.teacher.count(),

		// Academic Structure Metrics
		prisma.department.count(),
		prisma.course.count(),
		prisma.courseDetails.count({ where: { status: "ONGOING" } }),
		prisma.studentEnrollment.count(),

		// Financial Metrics (All-time Revenue)
		prisma.payment.aggregate({
			where: { status: "SUCCESS" },
			_sum: { amount: true },
		}),

		// Financial Metrics (Current Month Revenue)
		prisma.payment.aggregate({
			where: {
				status: "SUCCESS",
				created_at: { gte: startOfCurrentMonth },
			},
			_sum: { amount: true },
		}),

		// Time-based Growth Metrics (New institutions this month)
		prisma.institution.count({
			where: { created_at: { gte: startOfCurrentMonth } },
		}),

		// Time-based Growth Metrics (New students registered this month)
		prisma.student.count({
			where: { created_at: { gte: startOfCurrentMonth } },
		}),
	]);

	return {
		institutions: {
			total: totalInstitutions,
			active: activeInstitutions,
			pending: pendingInstitutions,
			growthThisMonth: newInstitutionsThisMonth,
		},
		users: {
			totalStudents,
			totalTeachers,
			newStudentsThisMonth,
		},
		academics: {
			totalDepartments,
			totalCourseBlueprints: totalCourses,
			ongoingCourseSections: activeCourseSections,
			totalStudentEnrollments: totalEnrollments,
		},
		financials: {
			totalRevenue: totalRevenueResult._sum.amount || 0,
			revenueThisMonth: currentMonthRevenueResult._sum.amount || 0,
			currency: "BDT",
		},
		generatedAt: new Date().toISOString(),
	};
};



export const AdminService = { getPlatformOverview };
