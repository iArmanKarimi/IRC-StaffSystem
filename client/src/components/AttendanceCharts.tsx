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

interface AttendanceData {
	name: string;
	avgPresent: number;
	avgAbsent: number;
	avgSickLeave: number;
	avgLeave: number;
}

interface AttendanceChartsProps {
	branchData: AttendanceData[];
	rankData: AttendanceData[];
	loading?: boolean;
}

export function AttendanceCharts({
	branchData,
	rankData,
	loading = false,
}: AttendanceChartsProps) {
	const theme = useTheme();

	const ChartWrapper = ({
		title,
		data,
	}: {
		title: string;
		data: AttendanceData[];
	}) => (
		<Card sx={{ borderRadius: 2, boxShadow: 1, height: "100%" }}>
			<CardHeader
				title={title}
				titleTypographyProps={{ variant: "body2", fontWeight: 600 }}
			/>
			<CardContent
				sx={{ height: 300, p: 0, display: "flex", justifyContent: "center" }}
			>
				{loading ? (
					<Box sx={{ textAlign: "center", py: 3, width: "100%" }}>
						<Typography color="text.secondary">Loading...</Typography>
					</Box>
				) : data.length === 0 ? (
					<Box sx={{ textAlign: "center", py: 3, width: "100%" }}>
						<Typography color="text.secondary">No data available</Typography>
					</Box>
				) : (
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={data}
							margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" tick={{ fontSize: 12 }} />
							<YAxis tick={{ fontSize: 12 }} />
							<Tooltip
								formatter={(value?: number) => value?.toFixed(2) || "0"}
							/>
							<Legend wrapperStyle={{ fontSize: 12 }} />
							<Bar dataKey="avgPresent" fill={theme.palette.success.main} />
							<Bar dataKey="avgAbsent" fill={theme.palette.error.main} />
							<Bar dataKey="avgSickLeave" fill={theme.palette.warning.main} />
							<Bar dataKey="avgLeave" fill={theme.palette.info.main} />
						</BarChart>
					</ResponsiveContainer>
				)}
			</CardContent>
		</Card>
	);

	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
				gap: 2,
			}}
		>
			<ChartWrapper title="Attendance by Branch" data={branchData} />
			<ChartWrapper title="Attendance by Rank" data={rankData} />
		</Box>
	);
}
