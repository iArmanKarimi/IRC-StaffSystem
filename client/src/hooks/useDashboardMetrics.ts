import { useMemo } from "react";
import type { IEmployee } from "../types/models";

interface DashboardMetrics {
	totalEmployees: number;
	activeCount: number;
	inactiveCount: number;
	onLeaveCount: number;
	averagePerformance: number;
	turnoverRate: number;
	driverCount: number;
	averageOvertimeHours: number;
	averageDailyLeave: number;
	averageSickLeave: number;
	averageAbsence: number;
}

interface FilterCriteria {
	province?: string;
	branch?: string;
	rank?: string;
	workplace?: string;
	status?: string;
	isDriver?: boolean;
}

export function useDashboardMetrics(
	employees: IEmployee[],
	filters: FilterCriteria
): DashboardMetrics {
	return useMemo(() => {
		// Apply filters
		const filtered = employees.filter((emp) => {
			if (filters.province && typeof emp.provinceId === "object") {
				if (emp.provinceId._id !== filters.province) return false;
			}
			if (filters.branch && emp.workPlace?.branch !== filters.branch)
				return false;
			if (filters.rank && emp.workPlace?.rank !== filters.rank) return false;
			if (
				filters.workplace &&
				emp.workPlace?.licensedWorkplace !== filters.workplace
			)
				return false;
			if (filters.status && emp.performance?.status !== filters.status)
				return false;
			if (filters.isDriver !== undefined) {
				if (filters.isDriver && !emp.performance?.truckDriver) return false;
				if (!filters.isDriver && emp.performance?.truckDriver) return false;
			}
			return true;
		});

		const totalEmployees = filtered.length;

		// Status counts
		const activeCount = filtered.filter(
			(e) => e.performance?.status === "active"
		).length;
		const inactiveCount = filtered.filter(
			(e) => e.performance?.status === "inactive"
		).length;
		const onLeaveCount = filtered.filter(
			(e) => e.performance?.status === "on_leave"
		).length;

		// Driver count
		const driverCount = filtered.filter(
			(e) => e.performance?.truckDriver
		).length;

		// Calculate averages
		const performanceValues = filtered
			.map((e) => e.performance?.dailyPerformance || 0)
			.filter((v) => v > 0);
		const averagePerformance =
			performanceValues.length > 0
				? performanceValues.reduce((a, b) => a + b, 0) / performanceValues.length
				: 0;

		// Turnover rate (employees with jobEndDate in current month)
		const currentDate = new Date();
		const currentYear = currentDate.getFullYear();
		const currentMonth = currentDate.getMonth();

		const turnoverCount = filtered.filter((e) => {
			if (!e.additionalSpecifications?.jobEndDate) return false;
			const endDate = new Date(e.additionalSpecifications.jobEndDate);
			return (
				endDate.getFullYear() === currentYear &&
				endDate.getMonth() === currentMonth
			);
		}).length;

		const turnoverRate =
			totalEmployees > 0 ? (turnoverCount / totalEmployees) * 100 : 0;

		// Attendance averages
		const overtimeValues = filtered
			.map((e) => e.performance?.overtime || 0)
			.filter((v) => v > 0);
		const averageOvertimeHours =
			overtimeValues.length > 0
				? overtimeValues.reduce((a, b) => a + b, 0) / overtimeValues.length
				: 0;

		const leaveValues = filtered
			.map((e) => e.performance?.dailyLeave || 0)
			.filter((v) => v > 0);
		const averageDailyLeave =
			leaveValues.length > 0
				? leaveValues.reduce((a, b) => a + b, 0) / leaveValues.length
				: 0;

		const sickLeaveValues = filtered
			.map((e) => e.performance?.sickLeave || 0)
			.filter((v) => v > 0);
		const averageSickLeave =
			sickLeaveValues.length > 0
				? sickLeaveValues.reduce((a, b) => a + b, 0) / sickLeaveValues.length
				: 0;

		const absenceValues = filtered
			.map((e) => e.performance?.absence || 0)
			.filter((v) => v > 0);
		const averageAbsence =
			absenceValues.length > 0
				? absenceValues.reduce((a, b) => a + b, 0) / absenceValues.length
				: 0;

		return {
			totalEmployees,
			activeCount,
			inactiveCount,
			onLeaveCount,
			averagePerformance: Math.round(averagePerformance * 100) / 100,
			turnoverRate: Math.round(turnoverRate * 100) / 100,
			driverCount,
			averageOvertimeHours: Math.round(averageOvertimeHours * 100) / 100,
			averageDailyLeave: Math.round(averageDailyLeave * 100) / 100,
			averageSickLeave: Math.round(averageSickLeave * 100) / 100,
			averageAbsence: Math.round(averageAbsence * 100) / 100,
		};
	}, [employees, filters]);
}
