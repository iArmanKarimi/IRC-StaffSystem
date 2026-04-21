import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useEmployee } from "../useEmployee";
import { provinceApi } from "../../api/api";

vi.mock("../../api/api");

describe("useEmployee", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should set error when provinceId is missing", async () => {
		const { result } = renderHook(() =>
			useEmployee(undefined, "emp-123")
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe("شناسه‌های مورد نیاز موجود نیست");
		expect(result.current.employee).toBeNull();
		expect(result.current.loading).toBe(false);
		expect(provinceApi.getEmployee).not.toHaveBeenCalled();
	});

	it("should set error when employeeId is missing", async () => {
		const { result } = renderHook(() =>
			useEmployee("prov-1", undefined)
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe("شناسه‌های مورد نیاز موجود نیست");
		expect(result.current.employee).toBeNull();
		expect(result.current.loading).toBe(false);
		expect(provinceApi.getEmployee).not.toHaveBeenCalled();
	});

	it("should set error when both IDs are missing", async () => {
		const { result } = renderHook(() => useEmployee(undefined, undefined));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe("شناسه‌های مورد نیاز موجود نیست");
		expect(result.current.employee).toBeNull();
		expect(provinceApi.getEmployee).not.toHaveBeenCalled();
	});

	it("should fetch employee successfully", async () => {
		const mockEmployee = {
			_id: "emp-123",
			basicInfo: {
				firstName: "علی",
				lastName: "محمدی",
				nationalID: "1234567890",
				male: true,
				married: false,
				childrenCount: 0,
			},
			additionalSpecifications: {
				contactNumber: "09123456789",
				jobStartDate: new Date(),
			},
			workPlace: {
				branch: "شعبه مرکزی",
				rank: "کارشناس",
				licensedWorkplace: "مرکز",
			},
			provinceId: "prov-1",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		vi.mocked(provinceApi.getEmployee).mockResolvedValueOnce({
			success: true,
			data: mockEmployee,
		} as any);

		const { result } = renderHook(() =>
			useEmployee("prov-1", "emp-123")
		);

		expect(result.current.loading).toBe(true);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.employee).toEqual(mockEmployee);
		expect(result.current.error).toBeNull();
		expect(provinceApi.getEmployee).toHaveBeenCalledWith("prov-1", "emp-123");
	});

	it("should set error when API returns success: false", async () => {
		vi.mocked(provinceApi.getEmployee).mockResolvedValueOnce({
			success: false,
			error: "کارمند یافت نشد",
		} as any);

		const { result } = renderHook(() =>
			useEmployee("prov-1", "emp-999")
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe("کارمند یافت نشد");
		expect(result.current.employee).toBeNull();
		expect(provinceApi.getEmployee).toHaveBeenCalledWith("prov-1", "emp-999");
	});

	it("should set default error message when API error is empty", async () => {
		vi.mocked(provinceApi.getEmployee).mockResolvedValueOnce({
			success: false,
		} as any);

		const { result } = renderHook(() =>
			useEmployee("prov-1", "emp-999")
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe("کارمند یافت نشد");
		expect(result.current.employee).toBeNull();
	});

	it("should handle network errors", async () => {
		vi.mocked(provinceApi.getEmployee).mockRejectedValueOnce(
			new Error("Network Error")
		);

		const { result } = renderHook(() =>
			useEmployee("prov-1", "emp-123")
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe("Network Error");
		expect(result.current.employee).toBeNull();
	});

	it("should handle non-Error thrown values", async () => {
		vi.mocked(provinceApi.getEmployee).mockRejectedValueOnce(
			"String error"
		);

		const { result } = renderHook(() =>
			useEmployee("prov-1", "emp-123")
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe("خطا در بارگذاری کارمند");
		expect(result.current.employee).toBeNull();
	});

	it("should call refetch to fetch data again", async () => {
		const mockEmployee = {
			_id: "emp-123",
			basicInfo: {
				firstName: "علی",
				lastName: "محمدی",
				nationalID: "1234567890",
				male: true,
				married: false,
				childrenCount: 0,
			},
			additionalSpecifications: {
				contactNumber: "09123456789",
				jobStartDate: new Date(),
			},
			workPlace: {
				branch: "شعبه مرکزی",
				rank: "کارشناس",
				licensedWorkplace: "مرکز",
			},
			provinceId: "prov-1",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		vi.mocked(provinceApi.getEmployee).mockResolvedValueOnce({
			success: true,
			data: mockEmployee,
		} as any);

		const { result } = renderHook(() =>
			useEmployee("prov-1", "emp-123")
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.employee).toEqual(mockEmployee);

		// Call refetch
		await act(async () => {
			await result.current.refetch();
		});

		expect(provinceApi.getEmployee).toHaveBeenCalledTimes(2);
	});

	it("should clear error and refetch when IDs change", async () => {
		vi.mocked(provinceApi.getEmployee).mockResolvedValueOnce({
			success: false,
			error: "First error",
		} as any);

		const { result, rerender } = renderHook(
			({ provinceId, employeeId }) =>
				useEmployee(provinceId, employeeId),
			{ initialProps: { provinceId: "prov-1", employeeId: "emp-1" } }
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe("First error");

		// Change IDs
		vi.mocked(provinceApi.getEmployee).mockResolvedValueOnce({
			success: true,
			data: {
				_id: "emp-2",
				basicInfo: {
					firstName: "فاطمه",
					lastName: "احمدی",
					nationalID: "0987654321",
					male: false,
					married: true,
					childrenCount: 1,
				},
				additionalSpecifications: {
					contactNumber: "09129876543",
					jobStartDate: new Date(),
				},
				workPlace: {
					branch: "شعبه فرعی",
					rank: "کارشناس ارشد",
					licensedWorkplace: "فرعی",
				},
				provinceId: "prov-2",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		} as any);

		rerender({ provinceId: "prov-2", employeeId: "emp-2" });

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBeNull();
		expect(result.current.employee?._id).toBe("emp-2");
	});

	it("should reset loading state after refetch", async () => {
		vi.mocked(provinceApi.getEmployee).mockResolvedValueOnce({
			success: true,
			data: {
				_id: "emp-123",
				basicInfo: {
					firstName: "علی",
					lastName: "محمدی",
					nationalID: "1234567890",
					male: true,
					married: false,
					childrenCount: 0,
				},
				additionalSpecifications: {
					contactNumber: "09123456789",
					jobStartDate: new Date(),
				},
				workPlace: {
					branch: "شعبه مرکزی",
					rank: "کارشناس",
					licensedWorkplace: "مرکز",
				},
				provinceId: "prov-1",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		} as any);

		const { result } = renderHook(() =>
			useEmployee("prov-1", "emp-123")
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		// Start refetch
		act(() => {
			result.current.refetch();
		});

		expect(result.current.loading).toBe(true);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});
	});
});
