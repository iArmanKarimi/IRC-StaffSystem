import React from "react";
import {
	Box,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Stack,
	Alert,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import type { IPerformance } from "../types/models";
import {
	performanceNumberFieldGroups,
	shiftCountPerLocationOptions,
	shiftDurationOptions,
} from "./common/performanceFields";

interface PerformanceDisplayProps {
	performance: IPerformance;
	onChange: (key: keyof IPerformance, value: any) => void;
	locked?: boolean;
}

const PerformanceDisplay: React.FC<PerformanceDisplayProps> = ({
	performance,
	onChange,
	locked,
}) => {
	return (
		<Stack spacing={2.5}>
			{locked && (
				<Alert severity="warning" icon={<LockIcon />}>
					سوابق عملکرد در حال حاضر قابل ویرایش نمی باشد.
				</Alert>
			)}

			{performanceNumberFieldGroups.map((group, groupIndex) => (
				<Box
					key={groupIndex}
					sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}
				>
					{group.map((field) => (
						<TextField
							key={field.key}
							label={field.label}
							type="number"
							required={field.required}
							inputProps={{ min: field.min, max: field.max }}
							sx={{ flex: "1 1 calc(50% - 12px)", minWidth: 200 }}
							value={performance[field.key] as number}
							onChange={(e) => onChange(field.key, Number(e.target.value))}
							disabled={locked}
						/>
					))}
				</Box>
			))}

			<Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
				<FormControl
					sx={{ flex: "1 1 calc(50% - 12px)", minWidth: 200 }}
					required
					disabled={locked}
				>
					<InputLabel>تعداد شیفت در هر مکان</InputLabel>
					<Select
						value={performance.shiftCountPerLocation}
						label="تعداد شیفت در هر مکان"
						onChange={(e) =>
							onChange("shiftCountPerLocation", Number(e.target.value))
						}
					>
						{shiftCountPerLocationOptions.map((option) => (
							<MenuItem key={option.value} value={option.value}>
								{option.label}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				<FormControl
					sx={{ flex: "1 1 calc(50% - 12px)", minWidth: 200 }}
					required
					disabled={locked}
				>
					<InputLabel>مدت شیفت</InputLabel>
					<Select
						value={performance.shiftDuration}
						label="مدت شیفت"
						onChange={(e) => onChange("shiftDuration", Number(e.target.value))}
					>
						{shiftDurationOptions.map((option) => (
							<MenuItem key={option.value} value={option.value}>
								{option.label}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Box>

			<TextField
				label="یادداشت‌ها"
				multiline
				rows={3}
				disabled={locked}
				fullWidth
				value={performance.notes ?? ""}
				onChange={(e) => onChange("notes", e.target.value)}
				placeholder="یادداشت‌های اضافی را بنویسید..."
			/>
		</Stack>
	);
};

export default PerformanceDisplay;
