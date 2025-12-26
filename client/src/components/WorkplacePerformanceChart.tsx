import { Card, CardContent, CardHeader, Box, Typography } from "@mui/material";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import { useTheme } from "@mui/material/styles";

interface WorkplacePerformanceData {
	name: string;
	avgPerformance: number;
	avgOvertimeHours: number;
	employeeCount: number;
}

interface WorkplacePerformanceChartProps {
	data: WorkplacePerformanceData[];
	loading?: boolean;
}

export function WorkplacePerformanceChart({
	data,
	loading = false,
}: WorkplacePerformanceChartProps) {
	const theme = useTheme();

	return (
		<Card sx={{ borderRadius: 2, boxShadow: 1 }}>
			<CardHeader
				title="Workplace Performance Overview"
				titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
			/>
			<CardContent
				sx={{ height: 350, p: 2, display: "flex", justifyContent: "center" }}
			>
				{loading ? (
					<Box sx={{ textAlign: "center", py: 3 }}>
						<Typography color="text.secondary">Loading...</Typography>
					</Box>
				) : data.length === 0 ? (
					<Box sx={{ textAlign: "center", py: 3 }}>
						<Typography color="text.secondary">No data available</Typography>
					</Box>
				) : (
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={data}
							margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								dataKey="name"
								angle={-45}
								textAnchor="end"
								height={100}
								tick={{ fontSize: 11 }}
							/>
							<YAxis tick={{ fontSize: 12 }} />
							<Tooltip
								formatter={(value?: number) => value?.toFixed(2) || "0"}
								contentStyle={{
									backgroundColor: theme.palette.background.paper,
									border: `1px solid ${theme.palette.divider}`,
									borderRadius: 4,
								}}
							/>
							<Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
							<Bar dataKey="avgPerformance" fill={theme.palette.primary.main} />
							<Bar
								dataKey="avgOvertimeHours"
								fill={theme.palette.secondary.main}
							/>
						</BarChart>
					</ResponsiveContainer>
				)}
			</CardContent>
		</Card>
	);
}
