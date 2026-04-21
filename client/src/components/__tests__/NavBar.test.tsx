import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NavBar from "../NavBar";
import { authApi } from "../../api/api";
import { useIsGlobalAdmin } from "../../hooks/useAuth";
import { ROUTES } from "../../const/endpoints";

vi.mock("../../api/api");
vi.mock("../../hooks/useAuth");
vi.mock("@mui/material/useMediaQuery", () => ({
	default: vi.fn(() => false),
}));

describe("NavBar", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(useIsGlobalAdmin as any).mockReturnValue({ isGlobalAdmin: false });
	});

	it("should render default title when no title is provided", () => {
		render(
			<MemoryRouter>
				<NavBar />
			</MemoryRouter>
		);

		expect(
			screen.getByText(
				"سامانه مدیریت کارمندان جمعیت هلال احمر ایران"
			)
		).toBeInTheDocument();
	});

	it("should render custom title when provided", () => {
		render(
			<MemoryRouter>
				<NavBar title="عنوان سفارشی" />
			</MemoryRouter>
		);

		expect(screen.getByText("عنوان سفارشی")).toBeInTheDocument();
	});

	it("should not show logout button when showLogout is false", () => {
		render(
			<MemoryRouter>
				<NavBar showLogout={false} />
			</MemoryRouter>
		);

		expect(screen.queryByLabelText("خروج")).not.toBeInTheDocument();
	});

	it("should show logout button by default", () => {
		render(<MemoryRouter><NavBar /></MemoryRouter>);

		expect(screen.getByLabelText("خروج")).toBeInTheDocument();
	});

	it("should navigate to backTo when back button is clicked", () => {
		const mockNavigate = vi.fn();
		vi.spyOn(require("react-router-dom"), "useNavigate").mockReturnValue(
			mockNavigate
		);

		render(
			<MemoryRouter initialEntries={["/employees"]}>
				<NavBar backTo="/provinces" backLabel="بازگشت به استان‌ها" />
			</MemoryRouter>
		);

		const backButton = screen.getByLabelText("بازگشت به استان‌ها");
		fireEvent.click(backButton);

		expect(mockNavigate).toHaveBeenCalledWith("/provinces");
	});

	it("should use default back label when not provided", () => {
		const mockNavigate = vi.fn();
		vi.spyOn(require("react-router-dom"), "useNavigate").mockReturnValue(
			mockNavigate
		);

		render(
			<MemoryRouter initialEntries={["/employees"]}>
				<NavBar backTo="/provinces" />
			</MemoryRouter>
		);

		expect(screen.getByLabelText("بازگشت")).toBeInTheDocument();
	});

	it("should show loading text when logout is in progress", () => {
		render(
			<MemoryRouter>
				<NavBar />
			</MemoryRouter>
		);

		const logoutButton = screen.getByLabelText("خروج");
		fireEvent.click(logoutButton);

		// Button should show loading state
		expect(screen.getByText("در حال خروج...")).toBeInTheDocument();
	});

	it("should redirect to root on successful logout", async () => {
		const mockNavigate = vi.fn();
		vi.spyOn(require("react-router-dom"), "useNavigate").mockReturnValue(
			mockNavigate
		);

		(authApi.logout as any).mockResolvedValue({ success: true });

		render(
			<MemoryRouter initialEntries={["/employees"]}>
				<NavBar />
			</MemoryRouter>
		);

		const logoutButton = screen.getByLabelText("خروج");
		fireEvent.click(logoutButton);

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ROOT, { replace: true });
	});

	it("should handle logout error gracefully", async () => {
		const mockNavigate = vi.fn();
		vi.spyOn(require("react-router-dom"), "useNavigate").mockReturnValue(
			mockNavigate
		);

		const consoleSpy = vi.spyOn(console, "error").mockImplementation();
		(authApi.logout as any).mockRejectedValue(new Error("Logout failed"));

		render(
			<MemoryRouter>
				<NavBar />
			</MemoryRouter>
		);

		const logoutButton = screen.getByLabelText("خروج");
		fireEvent.click(logoutButton);

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(consoleSpy).toHaveBeenCalledWith("Logout failed:", expect.any(Error));
		consoleSpy.mockRestore();
	});

	it("should show provinces button for global admin on dashboard", () => {
		(useIsGlobalAdmin as any).mockReturnValue({ isGlobalAdmin: true });

		render(
			<MemoryRouter initialEntries={[ROUTES.ADMIN_DASHBOARD]}>
				<NavBar />
			</MemoryRouter>
		);

		expect(screen.getByLabelText("استان‌ها")).toBeInTheDocument();
	});

	it("should show dashboard button for global admin on provinces page", () => {
		(useIsGlobalAdmin as any).mockReturnValue({ isGlobalAdmin: true });

		render(
			<MemoryRouter initialEntries={[ROUTES.PROVINCES]}>
				<NavBar />
			</MemoryRouter>
		);

		expect(screen.getByLabelText("دشبورد مدیریت")).toBeInTheDocument();
	});

	it("should not show provinces/dashboard buttons for non-global admin", () => {
		render(
			<MemoryRouter initialEntries={[ROUTES.ADMIN_DASHBOARD]}>
				<NavBar />
			</MemoryRouter>
		);

		expect(screen.queryByLabelText("استان‌ها")).not.toBeInTheDocument();
		expect(screen.queryByLabelText("دشبورد مدیریت")).not.toBeInTheDocument();
	});
});
