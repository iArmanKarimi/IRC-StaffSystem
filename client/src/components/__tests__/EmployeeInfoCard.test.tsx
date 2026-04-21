import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmployeeInfoCard } from "../EmployeeInfoCard";
import type { IEmployee } from "../../types/models";

describe("EmployeeInfoCard", () => {
	const createMockEmployee = (): IEmployee => ({
		_id: "emp-123",
		basicInfo: {
			firstName: "علی",
			lastName: "محمدی",
			nationalID: "1234567890",
			male: true,
			married: true,
			childrenCount: 2,
		},
		additionalSpecifications: {
			educationalDegree: "کارشناسی",
			dateOfBirth: new Date("1990-03-21"),
			contactNumber: "09123456789",
			jobStartDate: new Date("2015-06-21"),
			truckDriver: true,
		},
		workPlace: {
			branch: "شعبه مرکزی",
			rank: "کارشناس ارشد",
			licensedWorkplace: "مرکز استان",
		},
		provinceId: "prov-1",
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	it("should render employee basic information", () => {
		const employee = createMockEmployee();

		render(<EmployeeInfoCard employee={employee} />);

		expect(screen.getByText("علی")).toBeInTheDocument();
		expect(screen.getByText("محمدی")).toBeInTheDocument();
		expect(screen.getByText("1234567890")).toBeInTheDocument();
		expect(screen.getByText("مرد")).toBeInTheDocument();
		expect(screen.getByText("متأهل")).toBeInTheDocument();
		expect(screen.getByText("2")).toBeInTheDocument();
	});

	it("should render additional specifications", () => {
		const employee = createMockEmployee();

		render(<EmployeeInfoCard employee={employee} />);

		expect(screen.getByText("کارشناسی")).toBeInTheDocument();
		expect(screen.getByText("09123456789")).toBeInTheDocument();
		expect(screen.getByText("بله")).toBeInTheDocument();
		expect(screen.getByText(/\d{1,2} [^\s]+ 13\d{2}/)).toBeInTheDocument();
	});

	it("should render workplace information", () => {
		const employee = createMockEmployee();

		render(<EmployeeInfoCard employee={employee} />);

		expect(screen.getByText("شعبه مرکزی")).toBeInTheDocument();
		expect(screen.getByText("کارشناس ارشد")).toBeInTheDocument();
		expect(screen.getByText("مرکز استان")).toBeInTheDocument();
	});

	it("should render section headers", () => {
		const employee = createMockEmployee();

		render(<EmployeeInfoCard employee={employee} />);

		expect(screen.getByText("اطلاعات پایه")).toBeInTheDocument();
		expect(screen.getByText("مشخصات تکمیلی")).toBeInTheDocument();
		expect(screen.getByText("اطلاعات شغلی")).toBeInTheDocument();
	});

	it("should render labels for all fields", () => {
		const employee = createMockEmployee();

		render(<EmployeeInfoCard employee={employee} />);

		expect(screen.getByText("نام")).toBeInTheDocument();
		expect(screen.getByText("نام خانوادگی")).toBeInTheDocument();
		expect(screen.getByText("کد ملی")).toBeInTheDocument();
		expect(screen.getByText("جنسیت")).toBeInTheDocument();
		expect(screen.getByText("وضعیت تأهل")).toBeInTheDocument();
		expect(screen.getByText("تعداد فرزندان")).toBeInTheDocument();
		expect(screen.getByText("تاریخ تولد")).toBeInTheDocument();
		expect(screen.getByText("شماره تماس")).toBeInTheDocument();
		expect(screen.getByText("مدرک تحصیلی")).toBeInTheDocument();
		expect(screen.getByText("تاریخ شروع کار")).toBeInTheDocument();
		expect(screen.getByText("تاریخ پایان کار")).toBeInTheDocument();
		expect(screen.getByText("شعبه")).toBeInTheDocument();
		expect(screen.getByText("رتبه")).toBeInTheDocument();
		expect(screen.getByText("محل کار مجاز")).toBeInTheDocument();
	});

	it("should render female for female employee", () => {
		const employee = createMockEmployee();
		employee.basicInfo.male = false;

		render(<EmployeeInfoCard employee={employee} />);

		expect(screen.getByText("زن")).toBeInTheDocument();
	});

	it("should render unmarried status for unmarried employee", () => {
		const employee = createMockEmployee();
		employee.basicInfo.married = false;

		render(<EmployeeInfoCard employee={employee} />);

		expect(screen.getByText("مجرد")).toBeInTheDocument();
	});

	it("should render false for truck driver", () => {
		const employee = createMockEmployee();
		employee.additionalSpecifications.truckDriver = false;

		render(<EmployeeInfoCard employee={employee} />);

		expect(screen.getByText("خیر")).toBeInTheDocument();
	});

	it("should handle empty children count", () => {
		const employee = createMockEmployee();
		employee.basicInfo.childrenCount = 0;

		render(<EmployeeInfoCard employee={employee} />);

		expect(screen.getByText("0")).toBeInTheDocument();
	});

	it("should handle missing job end date", () => {
		const employee = createMockEmployee();
		employee.additionalSpecifications.jobEndDate = undefined;

		render(<EmployeeInfoCard employee={employee} />);

		expect(screen.getByText("تاریخ پایان کار")).toBeInTheDocument();
		// Should render "-" for missing date
		expect(screen.getByText("-")).toBeInTheDocument();
	});
});
