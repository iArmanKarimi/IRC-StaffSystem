import { useMemo } from "react";
import type { IEmployee } from "../types/models";

export interface ProvinceData {
	provinceId: string;
	provinceName: string;
	employeeCount: number;
	activeCount: number;
	inactiveCount: number;
	onLeaveCount: number;
}

export interface AttendanceData {
	name: string;
	avgPresent: number;
	avgAbsent: number;
	avgSickLeave: number;
	avgLeave: number;
}

export interface WorkplacePerformanceData {
	name: string;
	avgPerformance: number;
	avgOvertimeHours: number;
	employeeCount: number;
}

export interface Milestone2Metrics {
	provinceData: ProvinceData[];
	branchAttendanceData: AttendanceData[];
	rankAttendanceData: AttendanceData[];
	workplacePerformanceData: WorkplacePerformanceData[];
}

export function useMilestone2Metrics(employees: IEmployee[]): Milestone2Metrics {
	return useMemo(() => {
		// Province Distribution
		const provinceMap = new Map<string, ProvinceData>();
		const branchMap = new Map<string, AttendanceData>();
		const rankMap = new Map<string, AttendanceData>();
		const workplaceMap = new Map<string, WorkplacePerformanceData>();

		employees.forEach((emp) => {
			// Province Distribution
			const provinceId = typeof emp.provinceId === "string" ? emp.provinceId : emp.provinceId?._id;
			const provinceName = typeof emp.provinceId === "string" ? "Unknown Province" : emp.provinceId?.name || "Unknown Province";

			if (provinceId && provinceName) {
				if (!provinceMap.has(provinceId)) {
					provinceMap.set(provinceId, {
						provinceId,
						provinceName,
						employeeCount: 0,
						activeCount: 0,
						inactiveCount: 0,
						onLeaveCount: 0,
					});
				}
				const pData = provinceMap.get(provinceId)!;
				pData.employeeCount += 1;
				if (emp.performance?.status === "active") pData.activeCount += 1;
				else if (emp.performance?.status === "inactive") pData.inactiveCount += 1;
				else if (emp.performance?.status === "on_leave") pData.onLeaveCount += 1;
			}

			// Branch Attendance
			const branch = emp.workPlace?.branch;
			if (branch) {
				if (!branchMap.has(branch)) {
					branchMap.set(branch, {
						name: branch,
						avgPresent: 0,
						avgAbsent: 0,
						avgSickLeave: 0,
						avgLeave: 0,
					});
				}
				const bData = branchMap.get(branch)!;
				if (emp.performance?.dailyLeave) {
					bData.avgLeave = (bData.avgLeave + emp.performance.dailyLeave) / 2;
				}
				if (emp.performance?.sickLeave) {
					bData.avgSickLeave = (bData.avgSickLeave + emp.performance.sickLeave) / 2;
				}
				if (emp.performance?.absence) {
					bData.avgAbsent = (bData.avgAbsent + emp.performance.absence) / 2;
				}
			}

			// Rank Attendance
			const rank = emp.workPlace?.rank;
			if (rank) {
				if (!rankMap.has(rank)) {
					rankMap.set(rank, {
						name: rank,
						avgPresent: 0,
						avgAbsent: 0,
						avgSickLeave: 0,
						avgLeave: 0,
					});
				}
				const rData = rankMap.get(rank)!;
				if (emp.performance?.dailyLeave) {
					rData.avgLeave = (rData.avgLeave + emp.performance.dailyLeave) / 2;
				}
				if (emp.performance?.sickLeave) {
					rData.avgSickLeave = (rData.avgSickLeave + emp.performance.sickLeave) / 2;
				}
				if (emp.performance?.absence) {
					rData.avgAbsent = (rData.avgAbsent + emp.performance.absence) / 2;
				}
			}

			// Workplace Performance
			const workplace = emp.workPlace?.licensedWorkplace;
			if (workplace) {
				if (!workplaceMap.has(workplace)) {
					workplaceMap.set(workplace, {
						name: workplace,
						avgPerformance: 0,
						avgOvertimeHours: 0,
						employeeCount: 0,
					});
				}
				const wData = workplaceMap.get(workplace)!;
				wData.employeeCount += 1;
				if (emp.performance?.dailyPerformance) {
					wData.avgPerformance += emp.performance.dailyPerformance;
				}
				if (emp.performance?.overtime) {
					wData.avgOvertimeHours += emp.performance.overtime;
				}
			}
		});

		// Calculate averages for workplace data
		workplaceMap.forEach((data) => {
			if (data.employeeCount > 0) {
				data.avgPerformance = data.avgPerformance / data.employeeCount;
				data.avgOvertimeHours = data.avgOvertimeHours / data.employeeCount;
			}
		});

		return {
			provinceData: Array.from(provinceMap.values()).sort(
				(a, b) => b.employeeCount - a.employeeCount
			),
			branchAttendanceData: Array.from(branchMap.values()).sort((a, b) =>
				a.name.localeCompare(b.name)
			),
			rankAttendanceData: Array.from(rankMap.values()).sort((a, b) =>
				a.name.localeCompare(b.name)
			),
			workplacePerformanceData: Array.from(workplaceMap.values()).sort(
				(a, b) => b.employeeCount - a.employeeCount
			),
		};
	}, [employees]);
}
