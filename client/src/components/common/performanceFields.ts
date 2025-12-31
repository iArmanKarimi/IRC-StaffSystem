import type { IPerformance } from "../../types/models";

export type PerformanceNumberFieldKey = keyof Pick<
	IPerformance,
	| "dailyPerformance"
	| "shiftCountPerLocation"
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
			key: "shiftCountPerLocation",
			label: "تعداد شیفت در هر مکان",
			min: 0,
			max: 31,
			required: true,
		},
	],
	[
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
		},
	],
	[
		{
			key: "travelAssignment",
			label: "ماموریت سفر",
			min: 0,
		},
	],
];

export const shiftDurationOptions: Array<{ value: IPerformance["shiftDuration"]; label: string }> = [
	{ value: 8, label: "8 ساعت" },
	{ value: 16, label: "16 ساعت" },
	{ value: 24, label: "24 ساعت" },
];

export const performanceStatusOptions: Array<{
	value: IPerformance["status"];
	label: string;
}> = [
		{ value: "active", label: "فعال" },
		{ value: "inactive", label: "غیرفعال" },
		{ value: "on_leave", label: "در مرخصی" },
	];
