import {
	Card,
	CardContent,
	CardHeader,
	Box,
	Stack,
	Typography,
	Chip,
	LinearProgress,
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
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PersonIcon from "@mui/icons-material/Person";

interface DriverSegmentationProps {
	driverCount: number;
	nonDriverCount: number;
	loading?: boolean;
}

export function DriverSegmentationPanel({
	driverCount,
	nonDriverCount,
	loading = false,
}: DriverSegmentationProps) {
	const theme = useTheme();

	const total = driverCount + nonDriverCount;
	const data = [
		{ name: "Drivers", value: driverCount, fill: theme.palette.primary.main },
		{
			name: "Non-Drivers",
			value: nonDriverCount,
			fill: theme.palette.secondary.main,
		},
	];

	const getPercentage = (value: number) =>
		total > 0 ? ((value / total) * 100).toFixed(1) : "0";

	return (
		<Card sx={{ borderRadius: 2, boxShadow: 1 }}>
			<CardHeader
				title="Driver Segmentation"
				titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
				aria-label="Driver Segmentation Chart showing distribution of drivers and non-drivers"
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
							role="img"
							aria-label={`Driver distribution: ${driverCount} drivers (${getPercentage(
								driverCount
							)}%), ${nonDriverCount} non-drivers (${getPercentage(
								nonDriverCount
							)}%)`}
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
									<Tooltip formatter={(value) => `${value} employees`} />
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						</Box>

						<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
							<Chip
								icon={<LocalShippingIcon />}
								label={`Drivers: ${driverCount} (${getPercentage(
									driverCount
								)}%)`}
								variant="outlined"
								color="primary"
								size="small"
								aria-label={`Drivers count: ${driverCount} out of ${total} total employees`}
							/>
							<Chip
								icon={<PersonIcon />}
								label={`Non-Drivers: ${nonDriverCount} (${getPercentage(
									nonDriverCount
								)}%)`}
								variant="outlined"
								color="secondary"
								size="small"
								aria-label={`Non-drivers count: ${nonDriverCount} out of ${total} total employees`}
							/>
						</Stack>

						<Stack spacing={1}>
							<Typography variant="caption" sx={{ fontWeight: 600 }}>
								Driver Distribution
							</Typography>
							<LinearProgress
								variant="determinate"
								value={(driverCount / total) * 100}
								sx={{
									height: 8,
									borderRadius: 4,
									backgroundColor: theme.palette.secondary.light,
									"& .MuiLinearProgress-bar": {
										backgroundColor: theme.palette.primary.main,
									},
								}}
								aria-valuenow={Math.round((driverCount / total) * 100)}
								aria-valuemin={0}
								aria-valuemax={100}
								role="progressbar"
								aria-label="Driver percentage of total workforce"
							/>
						</Stack>
					</Stack>
				)}
			</CardContent>
		</Card>
	);
}
