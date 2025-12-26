import { useState } from "react";
import {
	Box,
	Button,
	Stack,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Typography,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

interface DashboardFiltersProps {
	months: { value: string; label: string }[];
	provinces: { value: string; label: string }[];
	branches: { value: string; label: string }[];
	ranks: { value: string; label: string }[];
	workplaces: { value: string; label: string }[];
	statusOptions: { value: string; label: string }[];

	selectedMonth: string;
	selectedProvince: string;
	selectedBranch: string;
	selectedRank: string;
	selectedWorkplace: string;
	selectedStatus: string;
	isDriver: string;

	onMonthChange: (value: string) => void;
	onProvinceChange: (value: string) => void;
	onBranchChange: (value: string) => void;
	onRankChange: (value: string) => void;
	onWorkplaceChange: (value: string) => void;
	onStatusChange: (value: string) => void;
	onDriverChange: (value: string) => void;
	onResetFilters: () => void;
}

export function DashboardFilters({
	months,
	provinces,
	branches,
	ranks,
	workplaces,
	statusOptions,

	selectedMonth,
	selectedProvince,
	selectedBranch,
	selectedRank,
	selectedWorkplace,
	selectedStatus,
	isDriver,

	onMonthChange,
	onProvinceChange,
	onBranchChange,
	onRankChange,
	onWorkplaceChange,
	onStatusChange,
	onDriverChange,
	onResetFilters,
}: DashboardFiltersProps) {
	const [resetDialogOpen, setResetDialogOpen] = useState(false);

	const handleResetClick = () => {
		setResetDialogOpen(true);
	};

	const handleConfirmReset = () => {
		setResetDialogOpen(false);
		onResetFilters();
	};

	const hasActiveFilters =
		selectedProvince ||
		selectedBranch ||
		selectedRank ||
		selectedWorkplace ||
		selectedStatus ||
		isDriver;

	return (
		<>
			<Box
				sx={{
					display: "flex",
					flexDirection: { xs: "column", md: "row" },
					gap: { xs: 1.5, md: 2 },
					alignItems: { md: "flex-end" },
					p: 2,
					backgroundColor: "background.paper",
					borderRadius: 1,
					border: "1px solid",
					borderColor: "divider",
				}}
				role="region"
				aria-label="Dashboard filters for analytics data"
			>
				<Stack
					direction={{ xs: "column", sm: "row" }}
					spacing={1.5}
					sx={{ flex: 1, width: { xs: "100%", md: "auto" } }}
				>
					<FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 140 } }}>
						<InputLabel>Month</InputLabel>
						<Select
							value={selectedMonth}
							onChange={(e) => onMonthChange(e.target.value)}
							label="Month"
						>
							{months.map((m) => (
								<MenuItem key={m.value} value={m.value}>
									{m.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 120 } }}>
						<InputLabel>Province</InputLabel>
						<Select
							value={selectedProvince}
							onChange={(e) => onProvinceChange(e.target.value)}
							label="Province"
						>
							<MenuItem value="">All</MenuItem>
							{provinces.map((p) => (
								<MenuItem key={p.value} value={p.value}>
									{p.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 120 } }}>
						<InputLabel>Branch</InputLabel>
						<Select
							value={selectedBranch}
							onChange={(e) => onBranchChange(e.target.value)}
							label="Branch"
						>
							<MenuItem value="">All</MenuItem>
							{branches.map((b) => (
								<MenuItem key={b.value} value={b.value}>
									{b.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 100 } }}>
						<InputLabel>Rank</InputLabel>
						<Select
							value={selectedRank}
							onChange={(e) => onRankChange(e.target.value)}
							label="Rank"
						>
							<MenuItem value="">All</MenuItem>
							{ranks.map((r) => (
								<MenuItem key={r.value} value={r.value}>
									{r.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 130 } }}>
						<InputLabel>Workplace</InputLabel>
						<Select
							value={selectedWorkplace}
							onChange={(e) => onWorkplaceChange(e.target.value)}
							label="Workplace"
						>
							<MenuItem value="">All</MenuItem>
							{workplaces.map((w) => (
								<MenuItem key={w.value} value={w.value}>
									{w.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 100 } }}>
						<InputLabel>Status</InputLabel>
						<Select
							value={selectedStatus}
							onChange={(e) => onStatusChange(e.target.value)}
							label="Status"
						>
							<MenuItem value="">All</MenuItem>
							{statusOptions.map((s) => (
								<MenuItem key={s.value} value={s.value}>
									{s.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 100 } }}>
						<InputLabel>Driver</InputLabel>
						<Select
							value={isDriver}
							onChange={(e) => onDriverChange(e.target.value)}
							label="Driver"
						>
							<MenuItem value="">All</MenuItem>
							<MenuItem value="yes">Yes</MenuItem>
							<MenuItem value="no">No</MenuItem>
						</Select>
					</FormControl>
				</Stack>

				<Button
					onClick={handleResetClick}
					variant="outlined"
					color="secondary"
					startIcon={<ClearIcon />}
					disabled={!hasActiveFilters}
					sx={{ width: { xs: "100%", sm: "auto" } }}
				>
					Reset Filters
				</Button>
			</Box>

			{/* Reset Confirmation Dialog */}
			<Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
				<DialogTitle>Confirm Reset Filters</DialogTitle>
				<DialogContent>
					<Typography>
						Are you sure you want to reset all filters? This action cannot be
						undone.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={handleConfirmReset}
						variant="contained"
						color="warning"
					>
						Reset
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
