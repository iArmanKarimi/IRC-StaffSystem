import {
	Card,
	CardContent,
	CardHeader,
	Box,
	Stack,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	LinearProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface ProvinceData {
	provinceId: string;
	provinceName: string;
	employeeCount: number;
	activeCount: number;
	inactiveCount: number;
	onLeaveCount: number;
}

interface ProvinceDistributionPanelProps {
	data: ProvinceData[];
	loading?: boolean;
}

export function ProvinceDistributionPanel({
	data,
	loading = false,
}: ProvinceDistributionPanelProps) {
	const theme = useTheme();

	const totalEmployees = data.reduce((sum, p) => sum + p.employeeCount, 0);

	const getPercentage = (value: number) =>
		totalEmployees > 0 ? ((value / totalEmployees) * 100).toFixed(1) : "0";

	return (
		<Card sx={{ borderRadius: 2, boxShadow: 1 }}>
			<CardHeader
				title="Province Distribution"
				titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
			/>
			<CardContent>
				{loading ? (
					<Box sx={{ textAlign: "center", py: 3 }}>
						<Typography color="text.secondary">Loading...</Typography>
					</Box>
				) : data.length === 0 ? (
					<Box sx={{ textAlign: "center", py: 3 }}>
						<Typography color="text.secondary">No data available</Typography>
					</Box>
				) : (
					<TableContainer component={Paper} variant="outlined">
						<Table size="small">
							<TableHead>
								<TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
									<TableCell sx={{ fontWeight: 600 }}>Province</TableCell>
									<TableCell align="right" sx={{ fontWeight: 600 }}>
										Total
									</TableCell>
									<TableCell align="right" sx={{ fontWeight: 600 }}>
										Active
									</TableCell>
									<TableCell align="right" sx={{ fontWeight: 600 }}>
										Inactive
									</TableCell>
									<TableCell align="right" sx={{ fontWeight: 600 }}>
										On Leave
									</TableCell>
									<TableCell align="right" sx={{ fontWeight: 600 }}>
										% of Total
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{data.map((province) => (
									<TableRow
										key={province.provinceId}
										sx={{
											"&:hover": {
												backgroundColor: theme.palette.action.hover,
											},
										}}
									>
										<TableCell sx={{ fontWeight: 500 }}>
											{province.provinceName}
										</TableCell>
										<TableCell align="right">
											{province.employeeCount}
										</TableCell>
										<TableCell align="right">
											<Box
												sx={{
													color: theme.palette.success.main,
													fontWeight: 500,
												}}
											>
												{province.activeCount}
											</Box>
										</TableCell>
										<TableCell align="right">
											<Box
												sx={{
													color: theme.palette.error.main,
													fontWeight: 500,
												}}
											>
												{province.inactiveCount}
											</Box>
										</TableCell>
										<TableCell align="right">
											<Box
												sx={{
													color: theme.palette.warning.main,
													fontWeight: 500,
												}}
											>
												{province.onLeaveCount}
											</Box>
										</TableCell>
										<TableCell align="right">
											<Stack spacing={0.5}>
												<Typography variant="caption" sx={{ fontWeight: 600 }}>
													{getPercentage(province.employeeCount)}%
												</Typography>
												<LinearProgress
													variant="determinate"
													value={
														(province.employeeCount / totalEmployees) * 100
													}
													sx={{ height: 4, borderRadius: 2 }}
												/>
											</Stack>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				)}
			</CardContent>
		</Card>
	);
}
