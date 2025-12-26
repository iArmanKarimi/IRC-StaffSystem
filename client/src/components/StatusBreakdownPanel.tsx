import {
	Card,
	CardContent,
	CardHeader,
	Box,
	Stack,
	Typography,
	Chip,
} from "@mui/material";
import {
	PieChart,
	Pie,
	Cell,
	Legend,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { useTheme } from "@mui/material/styles";

interface StatusBreakdownProps {
	active: number;
	inactive: number;
	onLeave: number;
	loading?: boolean;
}

export function StatusBreakdownPanel({
	active,
	inactive,
	onLeave,
	loading = false,
}: StatusBreakdownProps) {
	const theme = useTheme();

	const total = active + inactive + onLeave;
	const data = [
		{ name: "Active", value: active, fill: theme.palette.success.main },
		{
			name: "Inactive",
			value: inactive,
			fill: theme.palette.error.main,
		},
		{ name: "On Leave", value: onLeave, fill: theme.palette.warning.main },
	];

	const getPercentage = (value: number) =>
		total > 0 ? ((value / total) * 100).toFixed(1) : "0";

	return (
		<Card sx={{ borderRadius: 2, boxShadow: 1 }}>
			<CardHeader
				title="Employee Status Breakdown"
				titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
				aria-label="Employee Status Breakdown Chart showing active, inactive, and on-leave employees"
			/>
			<CardContent>
				{loading ? (
					<Box sx={{ textAlign: "center", py: 3 }}>
						<Typography color="text.secondary">Loading...</Typography>
					</Box>
				) : total === 0 ? (
					<Box sx={{ textAlign: "center", py: 3 }}>
						<Typography color="text.secondary">No data available</Typography>
					</Box>
				) : (
					<Stack spacing={2}>
						<Box
							sx={{ height: 250, display: "flex", justifyContent: "center" }}
						>
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={data}
										cx="50%"
										cy="50%"
										innerRadius={60}
										outerRadius={90}
										paddingAngle={2}
										dataKey="value"
									>
										{data.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.fill} />
										))}
									</Pie>
									<Tooltip
										formatter={(value?: number) => `${value || 0} employees`}
									/>
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						</Box>

						<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
							<Chip
								icon={
									<Box
										sx={{
											width: 12,
											height: 12,
											borderRadius: "50%",
											backgroundColor: theme.palette.success.main,
										}}
									/>
								}
								label={`Active: ${active} (${getPercentage(active)}%)`}
								variant="outlined"
								color="success"
								size="small"
							/>
							<Chip
								icon={
									<Box
										sx={{
											width: 12,
											height: 12,
											borderRadius: "50%",
											backgroundColor: theme.palette.error.main,
										}}
									/>
								}
								label={`Inactive: ${inactive} (${getPercentage(inactive)}%)`}
								variant="outlined"
								color="error"
								size="small"
							/>
							<Chip
								icon={
									<Box
										sx={{
											width: 12,
											height: 12,
											borderRadius: "50%",
											backgroundColor: theme.palette.warning.main,
										}}
									/>
								}
								label={`On Leave: ${onLeave} (${getPercentage(onLeave)}%)`}
								variant="outlined"
								color="warning"
								size="small"
							/>
						</Stack>
					</Stack>
				)}
			</CardContent>
		</Card>
	);
}
