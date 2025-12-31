import React from "react";
import {
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Typography,
	Box,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { IPerformance } from "../types/models";
import {
	performanceNumberFieldGroups,
	shiftDurationOptions,
	performanceStatusOptions,
} from "./common/performanceFields";

interface PerformanceAccordionProps {
	performance: IPerformance;
	index: number;
	onChange: (key: keyof IPerformance, value: any) => void;
}

const PerformanceAccordion: React.FC<PerformanceAccordionProps> = ({
	performance,
	index,
	onChange,
}) => {
	return (
		<Accordion defaultExpanded={index === 0}>
			<AccordionSummary expandIcon={<ExpandMoreIcon />}>
				<Typography fontWeight="bold">{`عملکرد #${index + 1}`}</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<Stack spacing={2.5} sx={{ mt: 1 }}>
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
								/>
							))}
						</Box>
					))}

					<FormControl
						sx={{ flex: "1 1 calc(50% - 12px)", minWidth: 200 }}
						required
					>
						<InputLabel>مدت شیفت</InputLabel>
						<Select
							value={performance.shiftDuration}
							label="مدت شیفت"
							onChange={(e) =>
								onChange("shiftDuration", Number(e.target.value))
							}
						>
							{shiftDurationOptions.map((option) => (
								<MenuItem key={option.value} value={option.value}>
									{option.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<FormControl fullWidth>
						<InputLabel>وضعیت</InputLabel>
						<Select
							value={performance.status || "active"}
							label="وضعیت"
							onChange={(e) => onChange("status", e.target.value)}
						>
							{performanceStatusOptions.map((option) => (
								<MenuItem key={option.value} value={option.value}>
									{option.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<TextField
						label="یادداشت‌ها"
						multiline
						rows={2}
						value={performance.notes || ""}
						onChange={(e) => onChange("notes", e.target.value)}
						fullWidth
					/>
				</Stack>
			</AccordionDetails>
		</Accordion>
	);
};

export default PerformanceAccordion;
