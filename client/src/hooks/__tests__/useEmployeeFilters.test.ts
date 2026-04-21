import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEmployeeFilters } from "../useEmployeeFilters";

describe("useEmployeeFilters", () => {
	const withoutUndefined = (filters: Record<string, unknown>) =>
		Object.fromEntries(
			Object.entries(filters).filter(([, value]) => value !== undefined)
		);

	it("should initialize with default values when no URL params", () => {
		const { result } = renderHook(() => useEmployeeFilters(20));

		expect(result.current.page).toBe(0);
		expect(result.current.searchTerm).toBe("");
		expect(result.current.searchField).toBe("all");
		expect(result.current.performanceMetric).toBe("");
		expect(result.current.performanceValue).toBe(null);
		expect(result.current.sortModel).toEqual([]);
		expect(result.current.toggleFilters).toEqual({
			maritalStatus: "",
			gender: "",
			status: "",
			truckDriverOnly: false,
		});
		expect(withoutUndefined(result.current.serverFilters)).toEqual({});
	});

	it("should initialize with page from URL", () => {
		const mockSearchParams = new URLSearchParams("page=3");
		const mockSetSearchParams = vi.fn();

		vi.spyOn(require("react-router-dom"), "useSearchParams").mockReturnValue([
			mockSearchParams,
			mockSetSearchParams,
		]);

		const { result } = renderHook(() => useEmployeeFilters(20));

		expect(result.current.page).toBe(2);
	});

	it("should update page in state and URL when updatePage is called", () => {
		const mockSearchParams = new URLSearchParams();
		const mockSetSearchParams = vi.fn();

		vi.spyOn(require("react-router-dom"), "useSearchParams").mockReturnValue([
			mockSearchParams,
			mockSetSearchParams,
		]);

		const { result } = renderHook(() => useEmployeeFilters(20));

		act(() => {
			result.current.updatePage(5);
		});

		expect(result.current.page).toBe(5);
		expect(mockSetSearchParams).toHaveBeenCalledWith({ page: "6" });
	});

	it("should sync page state with URL on mount", () => {
		const mockSearchParams = new URLSearchParams("page=5");
		const mockSetSearchParams = vi.fn();

		vi.spyOn(require("react-router-dom"), "useSearchParams").mockReturnValue([
			mockSearchParams,
			mockSetSearchParams,
		]);

		renderHook(() => useEmployeeFilters(20));

		expect(mockSetSearchParams).not.toHaveBeenCalled();
	});

	it("should reset to page 0 when searchTerm changes", () => {
		const mockSearchParams = new URLSearchParams("page=5");
		const mockSetSearchParams = vi.fn();

		vi.spyOn(require("react-router-dom"), "useSearchParams").mockReturnValue([
			mockSearchParams,
			mockSetSearchParams,
		]);

		const { result } = renderHook(() => useEmployeeFilters(20));

		act(() => {
			result.current.setSearchTerm("ali");
		});

		expect(result.current.page).toBe(0);
		expect(mockSetSearchParams).toHaveBeenCalledWith({ page: "1" });
	});

	it("should reset to page 0 when searchField changes", () => {
		const mockSearchParams = new URLSearchParams("page=5");
		const mockSetSearchParams = vi.fn();

		vi.spyOn(require("react-router-dom"), "useSearchParams").mockReturnValue([
			mockSearchParams,
			mockSetSearchParams,
		]);

		const { result } = renderHook(() => useEmployeeFilters(20));

		act(() => {
			result.current.setSearchField("firstName");
		});

		expect(result.current.page).toBe(0);
		expect(mockSetSearchParams).toHaveBeenCalledWith({ page: "1" });
	});

	it("should reset to page 0 when toggleFilters change", () => {
		const mockSearchParams = new URLSearchParams("page=5");
		const mockSetSearchParams = vi.fn();

		vi.spyOn(require("react-router-dom"), "useSearchParams").mockReturnValue([
			mockSearchParams,
			mockSetSearchParams,
		]);

		const { result } = renderHook(() => useEmployeeFilters(20));

		act(() => {
			result.current.setToggleFilters({
				...result.current.toggleFilters,
				gender: "male",
			});
		});

		expect(result.current.page).toBe(0);
		expect(mockSetSearchParams).toHaveBeenCalledWith({ page: "1" });
	});

	it("should build correct serverFilters with search term", () => {
		const mockSearchParams = new URLSearchParams();
		const mockSetSearchParams = vi.fn();

		vi.spyOn(require("react-router-dom"), "useSearchParams").mockReturnValue([
			mockSearchParams,
			mockSetSearchParams,
		]);

		const { result } = renderHook(() => useEmployeeFilters(20));

		act(() => {
			result.current.setSearchTerm("ali");
		});

		expect(withoutUndefined(result.current.serverFilters)).toEqual({
			search: "ali",
		});
	});

	it("should not include empty search term in serverFilters", () => {
		const mockSearchParams = new URLSearchParams();
		const mockSetSearchParams = vi.fn();

		vi.spyOn(require("react-router-dom"), "useSearchParams").mockReturnValue([
			mockSearchParams,
			mockSetSearchParams,
		]);

		const { result } = renderHook(() => useEmployeeFilters(20));

		expect(withoutUndefined(result.current.serverFilters)).toEqual({});
	});

	it("should build serverFilters with gender filter", () => {
		const mockSearchParams = new URLSearchParams();
		const mockSetSearchParams = vi.fn();

		vi.spyOn(require("react-router-dom"), "useSearchParams").mockReturnValue([
			mockSearchParams,
			mockSetSearchParams,
		]);

		const { result } = renderHook(() => useEmployeeFilters(20));

		act(() => {
			result.current.setToggleFilters({
				...result.current.toggleFilters,
				gender: "male",
			});
		});

		expect(withoutUndefined(result.current.serverFilters)).toEqual({
			gender: "male",
		});
	});

	it("should build serverFilters with maritalStatus filter", () => {
		const mockSearchParams = new URLSearchParams();
		const mockSetSearchParams = vi.fn();

		vi.spyOn(require("react-router-dom"), "useSearchParams").mockReturnValue([
			mockSearchParams,
			mockSetSearchParams,
		]);

		const { result } = renderHook(() => useEmployeeFilters(20));

		act(() => {
			result.current.setToggleFilters({
				...result.current.toggleFilters,
				maritalStatus: "married",
			});
		});

		expect(withoutUndefined(result.current.serverFilters)).toEqual({
			maritalStatus: "married",
		});
	});

	it("should build serverFilters with status filter", () => {
		const mockSearchParams = new URLSearchParams();
		const mockSetSearchParams = vi.fn();

		vi.spyOn(require("react-router-dom"), "useSearchParams").mockReturnValue([
			mockSearchParams,
			mockSetSearchParams,
		]);

		const { result } = renderHook(() => useEmployeeFilters(20));

		act(() => {
			result.current.setToggleFilters({
				...result.current.toggleFilters,
				status: "active",
			});
		});

		expect(withoutUndefined(result.current.serverFilters)).toEqual({
			status: "active",
		});
	});

	it("should build serverFilters with truckDriverOnly filter", () => {
		const mockSearchParams = new URLSearchParams();
		const mockSetSearchParams = vi.fn();

		vi.spyOn(require("react-router-dom"), "useSearchParams").mockReturnValue([
			mockSearchParams,
			mockSetSearchParams,
		]);

		const { result } = renderHook(() => useEmployeeFilters(20));

		act(() => {
			result.current.setToggleFilters({
				...result.current.toggleFilters,
				truckDriverOnly: true,
			});
		});

		expect(withoutUndefined(result.current.serverFilters)).toEqual({
			truckDriver: true,
		});
	});

	it("should build serverFilters with all filters", () => {
		const mockSearchParams = new URLSearchParams();
		const mockSetSearchParams = vi.fn();

		vi.spyOn(require("react-router-dom"), "useSearchParams").mockReturnValue([
			mockSearchParams,
			mockSetSearchParams,
		]);

		const { result } = renderHook(() => useEmployeeFilters(20));

		act(() => {
			result.current.setSearchTerm("ali");
			result.current.setToggleFilters({
				maritalStatus: "married",
				gender: "male",
				status: "active",
				truckDriverOnly: true,
			});
		});

		expect(withoutUndefined(result.current.serverFilters)).toEqual({
			search: "ali",
			maritalStatus: "married",
			gender: "male",
			status: "active",
			truckDriver: true,
		});
	});

	it("should sort by fullName when sortModel has fullName", () => {
		const mockSearchParams = new URLSearchParams();
		const mockSetSearchParams = vi.fn();

		vi.spyOn(require("react-router-dom"), "useSearchParams").mockReturnValue([
			mockSearchParams,
			mockSetSearchParams,
		]);

		const { result } = renderHook(() => useEmployeeFilters(20));

		act(() => {
			result.current.setSortModel([
				{ field: "fullName", sort: "asc" as const },
			]);
		});

		expect(withoutUndefined(result.current.serverFilters)).toEqual({
			sortBy: "fullName",
			sortOrder: "asc",
		});
	});

	it("should sort by nationalID when sortModel has nationalID", () => {
		const mockSearchParams = new URLSearchParams();
		const mockSetSearchParams = vi.fn();

		vi.spyOn(require("react-router-dom"), "useSearchParams").mockReturnValue([
			mockSearchParams,
			mockSetSearchParams,
		]);

		const { result } = renderHook(() => useEmployeeFilters(20));

		act(() => {
			result.current.setSortModel([
				{ field: "nationalID", sort: "desc" as const },
			]);
		});

		expect(withoutUndefined(result.current.serverFilters)).toEqual({
			sortBy: "nationalID",
			sortOrder: "desc",
		});
	});

	it("should sort by status when sortModel has status", () => {
		const mockSearchParams = new URLSearchParams();
		const mockSetSearchParams = vi.fn();

		vi.spyOn(require("react-router-dom"), "useSearchParams").mockReturnValue([
			mockSearchParams,
			mockSetSearchParams,
		]);

		const { result } = renderHook(() => useEmployeeFilters(20));

		act(() => {
			result.current.setSortModel([
				{ field: "status", sort: "asc" as const },
			]);
		});

		expect(withoutUndefined(result.current.serverFilters)).toEqual({
			sortBy: "status",
			sortOrder: "asc",
		});
	});

	it("should reset to page 0 when sortModel changes", () => {
		const mockSearchParams = new URLSearchParams("page=5");
		const mockSetSearchParams = vi.fn();

		vi.spyOn(require("react-router-dom"), "useSearchParams").mockReturnValue([
			mockSearchParams,
			mockSetSearchParams,
		]);

		const { result } = renderHook(() => useEmployeeFilters(20));

		act(() => {
			result.current.setSortModel([
				{ field: "fullName", sort: "asc" as const },
			]);
		});

		expect(result.current.page).toBe(0);
		expect(mockSetSearchParams).toHaveBeenCalledWith({ page: "1" });
	});

	it("should not add sorting to serverFilters when sortModel is empty", () => {
		const mockSearchParams = new URLSearchParams();
		const mockSetSearchParams = vi.fn();

		vi.spyOn(require("react-router-dom"), "useSearchParams").mockReturnValue([
			mockSearchParams,
			mockSetSearchParams,
		]);

		const { result } = renderHook(() => useEmployeeFilters(20));

		expect(withoutUndefined(result.current.serverFilters)).toEqual({});
	});

	it("should return correct limit from parameter", () => {
		const mockSearchParams = new URLSearchParams();
		const mockSetSearchParams = vi.fn();

		vi.spyOn(require("react-router-dom"), "useSearchParams").mockReturnValue([
			mockSearchParams,
			mockSetSearchParams,
		]);

		const { result } = renderHook(() => useEmployeeFilters(50));

		expect(result.current.limit).toBe(50);
	});

	it("should update performance metric state", () => {
		const mockSearchParams = new URLSearchParams();
		const mockSetSearchParams = vi.fn();

		vi.spyOn(require("react-router-dom"), "useSearchParams").mockReturnValue([
			mockSearchParams,
			mockSetSearchParams,
		]);

		const { result } = renderHook(() => useEmployeeFilters(20));

		act(() => {
			result.current.setPerformanceMetric("dailyPerformance");
		});

		expect(result.current.performanceMetric).toBe("dailyPerformance");
	});

	it("should update performance value state", () => {
		const mockSearchParams = new URLSearchParams();
		const mockSetSearchParams = vi.fn();

		vi.spyOn(require("react-router-dom"), "useSearchParams").mockReturnValue([
			mockSearchParams,
			mockSetSearchParams,
		]);

		const { result } = renderHook(() => useEmployeeFilters(20));

		act(() => {
			result.current.setPerformanceValue(100);
		});

		expect(result.current.performanceValue).toBe(100);
	});

	it("should reset to page 0 when performance filter changes", () => {
		const mockSearchParams = new URLSearchParams("page=5");
		const mockSetSearchParams = vi.fn();

		vi.spyOn(require("react-router-dom"), "useSearchParams").mockReturnValue([
			mockSearchParams,
			mockSetSearchParams,
		]);

		const { result } = renderHook(() => useEmployeeFilters(20));

		act(() => {
			result.current.setPerformanceMetric("dailyPerformance");
		});

		expect(result.current.page).toBe(0);
	});
});
