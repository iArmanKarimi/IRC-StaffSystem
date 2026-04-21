import type { IPerformance } from "../../types/models";

export type PerformanceNumberFieldKey = keyof Pick<
	IPerformance,
	| "dailyPerformance"
	| "overtime"
	| "dailyLeave"
	| "sickLeave"
	| "absence"
	| "travelAssignment"
>;

export type PerformanceStatusKey = keyof Pick<IPerformance, "status">;
export type PerformanceNotesKey = keyof Pick<IPerformance, "notes">;

export type PerformanceNumberField = {
	key: PerformanceNumberFieldKey;
	label: string;
	min?: number;
	max?: number;
	required?: boolean;
	suffix?: string;
};

export const performanceNumberFieldGroups: PerformanceNumberField[][] = [
	[
		{
			key: "dailyPerformance",
			label: "عملکرد روزانه",
			min: 0,
			max: 31,
			required: true,
		},
		{
			key: "overtime",
			label: "اضافه کاری",
			min: 0,
		},
		{
			key: "dailyLeave",
			label: "مرخصی روزانه",
			min: 0,
			max: 31,
		},
	],
	[
		{
			key: "sickLeave",
			label: "مرخصی استعلاجی",
			min: 0,
			max: 31,
		},
		{
			key: "absence",
			label: "غیبت",
			min: 0,
			max: 31,
		},
	],
	[
		{
			key: "travelAssignment",
			label: "ماموریت سفر",
			min: 0,
			max: 31,
		},
	],
];

export const shiftDurationOptions: Array<{
	value: IPerformance["shiftDuration"];
	label: string;
}> = [
	{ value: 8, label: "8 ساعت" },
	{ value: 12, label: "12 ساعت" },
	{ value: 16, label: "16 ساعت" },
	{ value: 24, label: "24 ساعت" },
];

const shiftDurationToCountMap: Record<IPerformance["shiftDuration"], number> = {
	8: 24,
	12: 16,
	16: 12,
	24: 8,
};

const shiftCountToDurationMap: Record<number, IPerformance["shiftDuration"]> = {
	8: 24,
	12: 16,
	16: 12,
	24: 8,
};

export const getShiftCountFromDuration = (
	shiftDuration: IPerformance["shiftDuration"],
): number => shiftDurationToCountMap[shiftDuration];

export const getShiftDurationFromCount = (
	shiftCountPerLocation: number,
): IPerformance["shiftDuration"] | null =>
	shiftCountToDurationMap[shiftCountPerLocation] ?? null;

export const shiftCountPerLocationOptions: Array<{
	value: number;
	label: string;
}> = [
	{ value: 24, label: "24 شیفت" },
	{ value: 16, label: "16 شیفت" },
	{ value: 12, label: "12 شیفت" },
	{ value: 8, label: "8 شیفت" },
];

export const performanceStatusOptions: Array<{
	value: IPerformance["status"];
	label: string;
}> = [
	{ value: "active", label: "فعال" },
	{ value: "inactive", label: "غیرفعال" },
	{ value: "on_leave", label: "در مرخصی" },
];
