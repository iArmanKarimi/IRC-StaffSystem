import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useEmployees } from "../useEmployees";
import { provinceApi } from "../../api/api";

vi.mock("../../api/api");

describe("useEmployees", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return validation error when provinceId is missing", async () => {
		const { result } = renderHook(() => useEmployees(undefined));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe("شناسه استان موجود نیست");
		expect(result.current.employees).toEqual([]);
		expect(result.current.pagination).toBeNull();
		expect(provinceApi.listEmployees).not.toHaveBeenCalled();
	});

	it("should fetch employees and pagination data", async () => {
		const response = {
			success: true,
			data: [
				{
					_id: "emp-1",
					basicInfo: {
						nationalID: "1234567890",
						firstName: "Ali",
						lastName: "Ahmadi",
						male: true,
						married: false,
						childrenCount: 0,
					},
					workPlace: {
						branch: "Branch A",
						rank: "Senior",
						licensedWorkplace: "HQ",
					},
					additionalSpecifications: {
						educationalDegree: "Bachelor",
						dateOfBirth: new Date("1990-01-01"),
						contactNumber: "09123456789",
						jobStartDate: new Date("2020-01-01"),
						truckDriver: false,
					},
					performance: {
						dailyPerformance: 5,
						shiftCountPerLocation: 24,
						shiftDuration: 8,
						overtime: 1,
						dailyLeave: 0,
						sickLeave: 0,
						absence: 0,
						travelAssignment: 0,
						status: "active",
					},
					provinceId: "prov-1",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			pagination: {
				total: 1,
				page: 1,
				limit: 20,
				pages: 1,
			},
		};

		vi.mocked(provinceApi.listEmployees).mockResolvedValueOnce(response as any);

		const { result } = renderHook(() =>
			useEmployees("prov-1", 1, 20, { search: "Ali", status: "active", truckDriver: true })
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(provinceApi.listEmployees).toHaveBeenCalledWith("prov-1", 1, 20, {
			search: "Ali",
			status: "active",
			truckDriver: true,
		});
		expect(result.current.employees).toHaveLength(1);
		expect(result.current.employees[0].basicInfo.firstName).toBe("Ali");
		expect(result.current.pagination).toEqual(response.pagination);
		expect(result.current.error).toBeNull();
	});

	it("should clear data and set error on fetch failure", async () => {
		vi.mocked(provinceApi.listEmployees).mockRejectedValueOnce(new Error("Network down"));

		const { result } = renderHook(() => useEmployees("prov-1"));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.employees).toEqual([]);
		expect(result.current.pagination).toBeNull();
		expect(result.current.error).toBe("Network down");
		expect(provinceApi.listEmployees).toHaveBeenCalledTimes(1);
	});

	it("should refetch when refetch is called", async () => {
		vi.mocked(provinceApi.listEmployees).mockResolvedValue({
			success: true,
			data: [],
			pagination: {
				total: 0,
				page: 1,
				limit: 20,
				pages: 0,
			},
		} as any);

		const { result } = renderHook(() => useEmployees("prov-1"));
		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		await act(async () => {
			await result.current.refetch();
		});

		expect(provinceApi.listEmployees).toHaveBeenCalledTimes(2);
	});
});
