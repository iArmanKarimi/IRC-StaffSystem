import { Router, Request, Response, NextFunction } from "express";
import * as XLSX from "xlsx";
import { Employee } from "../models/Employee";
import { auth } from "../middleware/auth";
import { USER_ROLE } from "../types/roles";
import { HttpError } from "../utils/errors";
import { logger } from "../middleware/logger";

const router = Router();

// Helper function to format dates consistently
const formatDate = (date: Date | string | undefined): string => {
	if (!date) return "-";
	try {
		const dateObj = typeof date === "string" ? new Date(date) : date;
		return dateObj.toLocaleDateString("en-US", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
	} catch {
		return "-";
	}
};

// Helper function to prepare Excel export data
const prepareEmployeesExcel = (employees: any[]) => {
	// Create a single complete sheet with all employee data (no _id)
	const completeData = employees.map((emp) => ({
		// Basic Info
		"First Name": emp.basicInfo?.firstName || "-",
		"Last Name": emp.basicInfo?.lastName || "-",
		"National ID": emp.basicInfo?.nationalID || "-",
		Gender: emp.basicInfo?.male ? "Male" : "Female",
		Married: emp.basicInfo?.married ? "Yes" : "No",
		"Children Count": emp.basicInfo?.childrenCount ?? "-",

		// Work Place
		Branch: emp.workPlace?.branch || "-",
		Rank: emp.workPlace?.rank || "-",
		"Licensed Workplace": emp.workPlace?.licensedWorkplace || "-",

		// Additional Specifications
		"Educational Degree": emp.additionalSpecifications?.educationalDegree || "-",
		"Date of Birth": formatDate(emp.additionalSpecifications?.dateOfBirth),
		"Contact Number": emp.additionalSpecifications?.contactNumber || "-",
		"Job Start Date": formatDate(emp.additionalSpecifications?.jobStartDate),
		"Job End Date": emp.additionalSpecifications?.jobEndDate
			? formatDate(emp.additionalSpecifications.jobEndDate)
			: "-",

		// Performance
		"Daily Performance": emp.performance?.dailyPerformance ?? "-",
		"Shift Count Per Location": emp.performance?.shiftCountPerLocation ?? "-",
		"Shift Duration": emp.performance?.shiftDuration
			? `${emp.performance.shiftDuration} hours`
			: "-",
		Overtime: emp.performance?.overtime ?? "-",
		"Daily Leave": emp.performance?.dailyLeave ?? "-",
		"Sick Leave": emp.performance?.sickLeave ?? "-",
		Absence: emp.performance?.absence ?? "-",
		"Truck Driver": emp.performance?.truckDriver ? "Yes" : "No",
		"Travel Assignment": emp.performance?.travelAssignment ?? "-",
		Status: emp.performance?.status?.toUpperCase() ?? "-",
		Notes: emp.performance?.notes || "-",

		// Meta
		Province: typeof emp.provinceId === "string" ? emp.provinceId : emp.provinceId?.name || "-",
		"Created At": formatDate(emp.createdAt),
		"Updated At": formatDate(emp.updatedAt),
	}));

	// Create workbook with single complete sheet
	const workbook = XLSX.utils.book_new();
	const completeSheet = XLSX.utils.json_to_sheet(completeData);

	// Set reasonable column widths
	const colCount = Object.keys(completeData[0] || {}).length;
	completeSheet["!cols"] = new Array(colCount).fill(0).map(() => ({ wch: 18 }));

	XLSX.utils.book_append_sheet(workbook, completeSheet, "Employees");

	return workbook;
};

// GET /employees/export-all - Export all employees to Excel (Global Admin only)
router.get("/export-all", auth(USER_ROLE.GLOBAL_ADMIN), async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Fetch all employees
		const employees = await Employee.find().lean();

		if (employees.length === 0) {
			throw new HttpError(404, "No employees found");
		}

		// Generate Excel workbook
		const workbook = prepareEmployeesExcel(employees);

		// Send as file
		const fileName = `employees_all_${new Date().toISOString().split("T")[0]}.xlsx`;
		res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
		res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

		const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
		logger.info("All employees exported to Excel", { count: employees.length });
		res.end(buffer);
	} catch (err: unknown) {
		next(err);
	}
});

export default router;
