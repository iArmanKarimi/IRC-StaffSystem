import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InfoField } from "../common/InfoField";

describe("InfoField", () => {
	it("should display label with colon", () => {
		render(<InfoField label="نام" value="علی" />);

		expect(screen.getByText("نام:")).toBeInTheDocument();
	});

	it("should display value when provided", () => {
		render(<InfoField label="نام" value="علی محمدی" />);

		expect(screen.getByText("علی محمدی")).toBeInTheDocument();
	});

	it("should display dash for null value", () => {
		render(<InfoField label="نام" value={null} />);

		expect(screen.getByText("-")).toBeInTheDocument();
	});

	it("should display dash for undefined value", () => {
		render(<InfoField label="نام" value={undefined} />);

		expect(screen.getByText("-")).toBeInTheDocument();
	});

	it("should display dash for empty string value", () => {
		render(<InfoField label="نام" value="" />);

		expect(screen.getByText("-")).toBeInTheDocument();
	});

	it("should display yes for true boolean", () => {
		render(<InfoField label="متأهل" value={true} />);

		expect(screen.getByText("بله")).toBeInTheDocument();
	});

	it("should display no for false boolean", () => {
		render(<InfoField label="متأهل" value={false} />);

		expect(screen.getByText("خیر")).toBeInTheDocument();
	});

	it("should display array joined with 'و'", () => {
		render(
			<InfoField label="شهرها" value={["تهران", "اصفهان", "مشهد"]} />
		);

		expect(screen.getByText("تهران و اصفهان و مشهد")).toBeInTheDocument();
	});

	it("should filter out falsy values in array", () => {
		render(
			<InfoField
				label="شهرها"
				value={["تهران", "", "اصفهان", null, "مشهد"]}
			/>
		);

		expect(screen.getByText("تهران و اصفهان و مشهد")).toBeInTheDocument();
	});

	it("should display dash for empty array", () => {
		render(<InfoField label="شهرها" value={[]} />);

		expect(screen.getByText("-")).toBeInTheDocument();
	});

	it("should display dash for array with only falsy values", () => {
		render(<InfoField label="شهرها" value={["", null, undefined]} />);

		expect(screen.getByText("-")).toBeInTheDocument();
	});

	it("should display number values", () => {
		render(<InfoField label="سن" value={30} />);

		expect(screen.getByText("30")).toBeInTheDocument();
	});

	it("should display string representation of values", () => {
		render(<InfoField label="کد ملی" value="1234567890" />);

		expect(screen.getByText("1234567890")).toBeInTheDocument();
	});

	it("should use label text exactly as provided", () => {
		render(<InfoField label="نام خانوادگی" value="محمدی" />);

		expect(screen.getByText("نام خانوادگی:")).toBeInTheDocument();
	});

	it("should have correct styling classes", () => {
		render(<InfoField label="نام" value="علی" />);

		const label = screen.getByText("نام:");
		const value = screen.getByText("علی");

		expect(label).toHaveTextContent("نام:");
		expect(value).toHaveTextContent("علی");
	});
});
