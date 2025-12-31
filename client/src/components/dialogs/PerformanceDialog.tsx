import { useState } from "react";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import LockIcon from "@mui/icons-material/Lock";
import { FormDialog } from "./FormDialog";
import type { IPerformance } from "../../types/models";
import {
	performanceNumberFieldGroups,
	shiftDurationOptions,
} from "../common/performanceFields";

type PerformanceDialogProps = {
	open: boolean;
	performance: IPerformance;
	saving: boolean;
	performanceLocked?: boolean;
	onClose: () => void;
	onSave: (data: IPerformance) => Promise<void>;
};

export function PerformanceDialog({
	open,
	performance,
	saving,
	performanceLocked,
	onClose,
	onSave,
}: PerformanceDialogProps) {
	const [formData, setFormData] = useState<IPerformance>(performance);

	const handleFieldChange = (
		field: keyof IPerformance,
		value: IPerformance[keyof IPerformance]
	) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSave = async () => {
		await onSave(formData);
	};

	return (
		<FormDialog
			open={open}
			title="ویرایش عملکرد"
			loading={saving}
			onClose={onClose}
			onSave={handleSave}
			saveDisabled={performanceLocked}
		>
			<Stack spacing={2}>
				{performanceLocked && (
					<Alert severity="error" icon={<LockIcon />}>
						ویرایش عملکرد در حال حاضر توسط مدیر کل قفل شده است. شما نمی‌توانید
						در این زمان تغییراتی ایجاد کنید.
					</Alert>
				)}

				{performanceNumberFieldGroups.map((group, groupIndex) => (
					<Box
						key={groupIndex}
						sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}
					>
						{group.map((field) => (
							<TextField
								key={field.key}
								label={field.label}
								type="number"
								required={field.required}
								inputProps={{ min: field.min, max: field.max }}
								sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
								value={formData[field.key] as number}
								onChange={(e) =>
									handleFieldChange(field.key, Number(e.target.value))
								}
							/>
						))}
					</Box>
				))}

				<FormControl
					sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
					required
				>
					<InputLabel>مدت شیفت</InputLabel>
					<Select
						value={formData.shiftDuration}
						label="مدت شیفت"
						onChange={(e) =>
							handleFieldChange("shiftDuration", Number(e.target.value))
						}
					>
						{shiftDurationOptions.map((option) => (
							<MenuItem key={option.value} value={option.value}>
								{option.label}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				<TextField
					label="یادداشت‌ها"
					multiline
					rows={3}
					value={formData.notes ?? ""}
					onChange={(e) => handleFieldChange("notes", e.target.value)}
					fullWidth
				/>
			</Stack>
		</FormDialog>
	);
}
