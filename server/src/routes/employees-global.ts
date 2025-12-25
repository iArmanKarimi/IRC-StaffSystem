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
	// Prepare Basic Info sheet
	const basicInfoData = employees.map((emp) => ({
		"Employee ID": emp._id?.toString() || "-",
		"First Name": emp.basicInfo?.firstName || "-",
		"Last Name": emp.basicInfo?.lastName || "-",
		"National ID": emp.basicInfo?.nationalID || "-",
		Gender: emp.basicInfo?.male ? "Male" : "Female",
		Married: emp.basicInfo?.married ? "Yes" : "No",
		"Children Count": emp.basicInfo?.childrenCount ?? "-",
		"Created At": formatDate(emp.createdAt),
	}));

	// Prepare WorkPlace sheet
	const workPlaceData = employees.map((emp) => ({
		"Employee ID": emp._id?.toString() || "-",
		"Employee Name": `${emp.basicInfo?.firstName} ${emp.basicInfo?.lastName}`,
		Branch: emp.workPlace?.branch || "-",
		Rank: emp.workPlace?.rank || "-",
		"Licensed Workplace": emp.workPlace?.licensedWorkplace || "-",
	}));

	// Prepare Additional Specifications sheet
	const additionalSpecsData = employees.map((emp) => ({
		"Employee ID": emp._id?.toString() || "-",
		"Employee Name": `${emp.basicInfo?.firstName} ${emp.basicInfo?.lastName}`,
		"Educational Degree": emp.additionalSpecifications?.educationalDegree || "-",
		"Date of Birth": formatDate(emp.additionalSpecifications?.dateOfBirth),
		"Contact Number": emp.additionalSpecifications?.contactNumber || "-",
		"Job Start Date": formatDate(emp.additionalSpecifications?.jobStartDate),
		"Job End Date": emp.additionalSpecifications?.jobEndDate
			? formatDate(emp.additionalSpecifications.jobEndDate)
			: "-",
	}));

	// Prepare Performance sheet
	const performanceData = employees.map((emp) => ({
		"Employee ID": emp._id?.toString() || "-",
		"Employee Name": `${emp.basicInfo?.firstName} ${emp.basicInfo?.lastName}`,
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
	}));

	// Create workbook and add sheets
	const workbook = XLSX.utils.book_new();
	const basicInfoSheet = XLSX.utils.json_to_sheet(basicInfoData);
	const workPlaceSheet = XLSX.utils.json_to_sheet(workPlaceData);
	const additionalSpecsSheet = XLSX.utils.json_to_sheet(additionalSpecsData);
	const performanceSheet = XLSX.utils.json_to_sheet(performanceData);

	// Set column widths
	basicInfoSheet["!cols"] = [20, 15, 15, 15, 10, 10, 15, 15].map((width) => ({ wch: width }));
	workPlaceSheet["!cols"] = [20, 25, 15, 15, 20].map((width) => ({ wch: width }));
	additionalSpecsSheet["!cols"] = [20, 25, 18, 15, 15, 15, 15].map((width) => ({ wch: width }));
	performanceSheet["!cols"] = [20, 25, 15, 18, 15, 10, 12, 12, 10, 15, 18, 12, 20].map((width) => ({ wch: width }));

	XLSX.utils.book_append_sheet(workbook, basicInfoSheet, "Basic Info");
	XLSX.utils.book_append_sheet(workbook, workPlaceSheet, "WorkPlace");
	XLSX.utils.book_append_sheet(workbook, additionalSpecsSheet, "Additional Specs");
	XLSX.utils.book_append_sheet(workbook, performanceSheet, "Performance");

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
