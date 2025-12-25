import * as XLSX from "xlsx";
import type { IEmployee } from "../types/models";

interface ExportRowData {
	[key: string]: string | number | boolean | undefined | null;
}

/**
 * Exports employee data to an Excel file with organized sections
 * @param employees - Array of employees to export
 * @param fileName - Optional custom file name (defaults to "employees.xlsx")
 */
export const exportEmployeesToExcel = (
	employees: IEmployee[],
	fileName: string = "employees.xlsx"
) => {
	if (!employees || employees.length === 0) {
		console.warn("No employees to export");
		return;
	}

	// Create a new workbook
	const workbook = XLSX.utils.book_new();

	// Prepare data sheets
	const allEmployeesSheet = prepareAllEmployeesSheet(employees);
	const basicInfoSheet = prepareBasicInfoSheet(employees);
	const workPlaceSheet = prepareWorkPlaceSheet(employees);
	const additionalSpecSheet = prepareAdditionalSpecsSheet(employees);
	const performanceSheet = preparePerformanceSheet(employees);

	// Add sheets to workbook
	XLSX.utils.book_append_sheet(workbook, allEmployeesSheet, "All Employees");
	XLSX.utils.book_append_sheet(workbook, basicInfoSheet, "Basic Info");
	XLSX.utils.book_append_sheet(workbook, workPlaceSheet, "WorkPlace");
	XLSX.utils.book_append_sheet(
		workbook,
		additionalSpecSheet,
		"Additional Specs"
	);
	XLSX.utils.book_append_sheet(workbook, performanceSheet, "Performance");

	// Generate and download the file
	XLSX.writeFile(workbook, fileName);
};

/**
 * Prepares the Basic Information sheet
 */
const prepareBasicInfoSheet = (employees: IEmployee[]) => {
	const data: ExportRowData[] = employees.map((emp) => ({
		"First Name": emp.basicInfo?.firstName || "-",
		"Last Name": emp.basicInfo?.lastName || "-",
		"National ID": emp.basicInfo?.nationalID || "-",
		Gender: emp.basicInfo?.male ? "Male" : "Female",
		Married: emp.basicInfo?.married ? "Yes" : "No",
		"Children Count": emp.basicInfo?.childrenCount ?? "-",
		"Created At": formatDate(emp.createdAt),
	}));

	const worksheet = XLSX.utils.json_to_sheet(data);

	// Format column widths
	const colWidths = [15, 15, 15, 10, 10, 15, 15];
	worksheet["!cols"] = colWidths.map((width) => ({ wch: width }));

	return worksheet;
};

/**
 * Prepares the WorkPlace Information sheet
 */
const prepareWorkPlaceSheet = (employees: IEmployee[]) => {
	const data: ExportRowData[] = employees.map((emp) => ({
		"Employee Name": `${emp.basicInfo?.firstName} ${emp.basicInfo?.lastName}`,
		Branch: emp.workPlace?.branch || "-",
		Rank: emp.workPlace?.rank || "-",
		"Licensed Workplace": emp.workPlace?.licensedWorkplace || "-",
	}));

	const worksheet = XLSX.utils.json_to_sheet(data);

	const colWidths = [20, 25, 15, 15, 20];
	worksheet["!cols"] = colWidths.map((width) => ({ wch: width }));

	return worksheet;
};

/**
 * Prepares the Additional Specifications sheet
 */
const prepareAdditionalSpecsSheet = (employees: IEmployee[]) => {
	const data: ExportRowData[] = employees.map((emp) => ({
		"Employee Name": `${emp.basicInfo?.firstName} ${emp.basicInfo?.lastName}`,
		"Educational Degree": emp.additionalSpecifications?.educationalDegree || "-",
		"Date of Birth": formatDate(emp.additionalSpecifications?.dateOfBirth),
		"Contact Number": emp.additionalSpecifications?.contactNumber || "-",
		"Job Start Date": formatDate(emp.additionalSpecifications?.jobStartDate),
		"Job End Date": emp.additionalSpecifications?.jobEndDate
			? formatDate(emp.additionalSpecifications.jobEndDate)
			: "-",
	}));

	const worksheet = XLSX.utils.json_to_sheet(data);

	const colWidths = [20, 25, 18, 15, 15, 15, 15];
	worksheet["!cols"] = colWidths.map((width) => ({ wch: width }));

	return worksheet;
};

/**
 * Prepares the Performance sheet
 */
const preparePerformanceSheet = (employees: IEmployee[]) => {
	const data: ExportRowData[] = employees.map((emp) => ({
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

	const worksheet = XLSX.utils.json_to_sheet(data);

	const colWidths = [20, 25, 15, 18, 15, 10, 12, 12, 10, 15, 18, 12, 20];
	worksheet["!cols"] = colWidths.map((width) => ({ wch: width }));

	return worksheet;
};

/**
 * Prepares a consolidated sheet that flattens all employee fields (excluding internal _id)
 */
const prepareAllEmployeesSheet = (employees: IEmployee[]) => {
	const data: ExportRowData[] = employees.map((emp) => ({
		// Basic Info
		"First Name": emp.basicInfo?.firstName || "-",
		"Last Name": emp.basicInfo?.lastName || "-",
		"National ID": emp.basicInfo?.nationalID || "-",
		Gender: emp.basicInfo?.male ? "Male" : "Female",
		Married: emp.basicInfo?.married ? "Yes" : "No",
		"Children Count": emp.basicInfo?.childrenCount ?? "-",

		// Work Place
		"Branch": emp.workPlace?.branch || "-",
		"Rank": emp.workPlace?.rank || "-",
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
		Province: typeof emp.provinceId === "string" ? emp.provinceId : (emp.provinceId as any)?.name || "-",
		"Created At": formatDate(emp.createdAt),
		"Updated At": formatDate(emp.updatedAt),
	}));

	const worksheet = XLSX.utils.json_to_sheet(data);
	// reasonable column widths for many fields
	const colWidths = new Array(Object.keys(data[0] || {}).length).fill(18);
	worksheet["!cols"] = colWidths.map((wch) => ({ wch }));
	return worksheet;
};

/**
 * Utility function to format dates consistently
 */
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
