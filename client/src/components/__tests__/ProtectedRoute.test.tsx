import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute";
import api from "../../api/api";
import { API_ENDPOINTS, ROUTES } from "../../const/endpoints";

vi.mock("../../api/api");

describe("ProtectedRoute", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should show loading indicator initially", () => {
		vi.mocked(api.get).mockReturnValue(
			new Promise(() => {
				// Never resolves
			})
		);

		render(
			<MemoryRouter>
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			</MemoryRouter>
		);

		expect(screen.getByText(/Verifying authorization.../i)).toBeInTheDocument();
		expect(screen.getByRole("progressbar")).toBeInTheDocument();
		expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
	});

	it("should render children when authorization succeeds", async () => {
		vi.mocked(api.get).mockResolvedValueOnce({
			success: true,
			data: [],
		} as any);

		render(
			<MemoryRouter>
				<ProtectedRoute>
					<div data-testid="content">Protected Content</div>
				</ProtectedRoute>
			</MemoryRouter>
		);

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(screen.getByTestId("content")).toBeInTheDocument();
		expect(
			screen.queryByText(/Verifying authorization.../i)
		).not.toBeInTheDocument();
	});

	it("should redirect to root when unauthorized", async () => {
		vi.mocked(api.get).mockRejectedValueOnce({
			response: { status: 401 },
		});

		render(
			<MemoryRouter initialEntries={["/employees"]}>
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			</MemoryRouter>
		);

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
		expect(window.location.pathname).toBe(ROUTES.ROOT);
	});

	it("should allow access with 403 status (province admin)", async () => {
		vi.mocked(api.get).mockRejectedValueOnce({
			response: { status: 403 },
		});

		render(
			<MemoryRouter>
				<ProtectedRoute>
					<div data-testid="content">Protected Content</div>
				</ProtectedRoute>
			</MemoryRouter>
		);

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(screen.getByTestId("content")).toBeInTheDocument();
	});

	it("should redirect to root on network error", async () => {
		vi.mocked(api.get).mockRejectedValueOnce(new Error("Network Error"));

		render(
			<MemoryRouter>
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			</MemoryRouter>
		);

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
		expect(window.location.pathname).toBe(ROUTES.ROOT);
	});

	it("should call api.get with provinces endpoint", async () => {
		vi.mocked(api.get).mockResolvedValueOnce({
			success: true,
			data: [],
		} as any);

		render(
			<MemoryRouter>
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			</MemoryRouter>
		);

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(api.get).toHaveBeenCalledWith(API_ENDPOINTS.PROVINCES);
	});
});
