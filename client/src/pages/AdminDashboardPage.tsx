import { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import PieChart from "@mui/icons-material/PieChart";
import BarChart from "@mui/icons-material/BarChart";
import TrendingUp from "@mui/icons-material/TrendingUp";
import Group from "@mui/icons-material/Group";
import LocationOn from "@mui/icons-material/LocationOn";
import {
	PieChart as MuiPieChart,
	Pie,
	Cell,
	BarChart as MuiBarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import NavBar from "../components/NavBar";
import { LoadingView } from "../components/states/LoadingView";
import { ErrorView } from "../components/states/ErrorView";
import { globalApi } from "../api/api";

interface StatCard {
	title: string;
	value: string | number;
	icon: React.ReactNode;
	color: string;
	trend?: string;
}

const COLORS = [
	"#0088FE",
	"#00C49F",
	"#FFBB28",
	"#FF8042",
	"#8884D8",
	"#82CA9D",
];

export default function AdminDashboardPage() {
	const [stats, setStats] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchDashboardStats = async () => {
			try {
				setLoading(true);
				const data = await globalApi.getDashboardStats();
				setStats(data.data);
				setError(null);
			} catch (err) {
				console.error("Failed to fetch dashboard stats:", err);
				setError("Failed to load dashboard statistics");
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardStats();
	}, []);

	if (loading) {
		return <LoadingView />;
	}

	if (error) {
		return <ErrorView message={error} />;
	}

	if (!stats) {
		return <ErrorView message="No data available" />;
	}

	const statCards: StatCard[] = [
		{
			title: "Total Employees",
			value: stats.totalEmployees,
			icon: <Group sx={{ fontSize: 40, color: "white" }} />,
			color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
		},
		{
			title: "Total Provinces",
			value: stats.totalProvinces,
			icon: <LocationOn sx={{ fontSize: 40, color: "white" }} />,
			color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
		},
		{
			title: "Active Employees",
			value: stats.employeesByStatus.active,
			icon: <TrendingUp sx={{ fontSize: 40, color: "white" }} />,
			color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
		},
		{
			title: "Avg Performance",
			value: stats.performanceMetrics.averageDailyPerformance.toFixed(2),
			icon: <BarChart sx={{ fontSize: 40, color: "white" }} />,
			color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
		},
	];

	const statusData = [
		{ name: "Active", value: stats.employeesByStatus.active },
		{ name: "Inactive", value: stats.employeesByStatus.inactive },
		{ name: "On Leave", value: stats.employeesByStatus.on_leave },
		{ name: "No Data", value: stats.employeesByStatus.no_performance },
	].filter((item) => item.value > 0);

	const provinceData = stats.employeesByProvince
		.sort((a: any, b: any) => b.count - a.count)
		.slice(0, 8);

	const genderData = [
		{ name: "Male", value: stats.employeeDistribution.maleCount },
		{ name: "Female", value: stats.employeeDistribution.femaleCount },
	];

	return (
		<Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
			<NavBar />
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Typography
					variant="h4"
					sx={{
						mb: 4,
						fontWeight: 700,
						background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
						backgroundClip: "text",
						WebkitBackgroundClip: "text",
						WebkitTextFillColor: "transparent",
					}}
				>
					📊 Admin Dashboard
				</Typography>

				{/* Key Metrics Cards */}
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: {
							xs: "1fr",
							sm: "1fr 1fr",
							md: "repeat(4, 1fr)",
						},
						gap: 3,
						mb: 4,
					}}
				>
					{statCards.map((card, index) => (
						<Card
							key={index}
							sx={{
								height: "100%",
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								padding: 2,
								background: card.color,
								color: "white",
								boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
								transition: "transform 0.3s ease, box-shadow 0.3s ease",
								"&:hover": {
									transform: "translateY(-8px)",
									boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)",
								},
							}}
						>
							<Box>
								<Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
									{card.title}
								</Typography>
								<Typography variant="h4" sx={{ fontWeight: 700 }}>
									{card.value}
								</Typography>
							</Box>
							<Box>{card.icon}</Box>
						</Card>
					))}
				</Box>

				{/* Charts Section */}
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
						gap: 3,
						mb: 4,
					}}
				>
					{/* Employee Status Distribution */}
					{statusData.length > 0 && (
						<Card sx={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)", p: 2 }}>
							<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
								<PieChart
									sx={{ mr: 1, verticalAlign: "middle", color: "#667eea" }}
								/>
								Employee Status
							</Typography>
							<ResponsiveContainer width="100%" height={300}>
								<MuiPieChart>
									<Pie
										data={statusData}
										cx="50%"
										cy="50%"
										labelLine={false}
										label={({ name, value }) => `${name}: ${value}`}
										outerRadius={80}
										fill="#8884d8"
										dataKey="value"
									>
										{statusData.map((_entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={COLORS[index % COLORS.length]}
											/>
										))}
									</Pie>
									<Tooltip />
								</MuiPieChart>
							</ResponsiveContainer>
						</Card>
					)}

					{/* Gender Distribution */}
					<Card sx={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)", p: 2 }}>
						<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
							<Group
								sx={{ mr: 1, verticalAlign: "middle", color: "#764ba2" }}
							/>
							Gender Distribution
						</Typography>
						<ResponsiveContainer width="100%" height={300}>
							<MuiPieChart>
								<Pie
									data={genderData}
									cx="50%"
									cy="50%"
									labelLine={false}
									label={({ name, value }) => `${name}: ${value}`}
									outerRadius={80}
									fill="#82ca9d"
									dataKey="value"
								>
									{genderData.map((_entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={COLORS[index % COLORS.length]}
										/>
									))}
								</Pie>
								<Tooltip />
							</MuiPieChart>
						</ResponsiveContainer>
					</Card>
				</Box>

				{/* Employees by Province - Full Width */}
				{provinceData.length > 0 && (
					<Card
						sx={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)", p: 2, mb: 4 }}
					>
						<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
							<LocationOn
								sx={{ mr: 1, verticalAlign: "middle", color: "#f5576c" }}
							/>
							Employees by Province
						</Typography>
						<ResponsiveContainer width="100%" height={300}>
							<MuiBarChart data={provinceData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis
									dataKey="name"
									angle={-45}
									textAnchor="end"
									height={80}
								/>
								<YAxis />
								<Tooltip />
								<Bar dataKey="count" fill="#0088FE" />
							</MuiBarChart>
						</ResponsiveContainer>
					</Card>
				)}

				{/* Performance Metrics */}
				<Card sx={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)", p: 2, mb: 4 }}>
					<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
						<TrendingUp
							sx={{ mr: 1, verticalAlign: "middle", color: "#8884d8" }}
						/>
						Performance Metrics
					</Typography>
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
							gap: 2,
						}}
					>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								padding: 2,
								backgroundColor: "#f5f5f5",
								borderRadius: 1,
							}}
						>
							<Typography variant="body2" sx={{ fontWeight: 500 }}>
								Avg Daily Performance:
							</Typography>
							<Typography
								variant="h6"
								sx={{ fontWeight: 700, color: "#0088FE" }}
							>
								{stats.performanceMetrics.averageDailyPerformance.toFixed(2)}
							</Typography>
						</Box>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								padding: 2,
								backgroundColor: "#f5f5f5",
								borderRadius: 1,
							}}
						>
							<Typography variant="body2" sx={{ fontWeight: 500 }}>
								Total Overtime Hours:
							</Typography>
							<Typography
								variant="h6"
								sx={{ fontWeight: 700, color: "#00C49F" }}
							>
								{stats.performanceMetrics.totalOvertimeHours}
							</Typography>
						</Box>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								padding: 2,
								backgroundColor: "#f5f5f5",
								borderRadius: 1,
							}}
						>
							<Typography variant="body2" sx={{ fontWeight: 500 }}>
								Total Leave Hours:
							</Typography>
							<Typography
								variant="h6"
								sx={{ fontWeight: 700, color: "#FFBB28" }}
							>
								{stats.performanceMetrics.totalLeaveHours}
							</Typography>
						</Box>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								padding: 2,
								backgroundColor: "#f5f5f5",
								borderRadius: 1,
							}}
						>
							<Typography variant="body2" sx={{ fontWeight: 500 }}>
								Total Absence Hours:
							</Typography>
							<Typography
								variant="h6"
								sx={{ fontWeight: 700, color: "#FF8042" }}
							>
								{stats.performanceMetrics.totalAbsenceHours}
							</Typography>
						</Box>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								padding: 2,
								backgroundColor: "#f5f5f5",
								borderRadius: 1,
							}}
						>
							<Typography variant="body2" sx={{ fontWeight: 500 }}>
								Truck Drivers:
							</Typography>
							<Typography
								variant="h6"
								sx={{ fontWeight: 700, color: "#764ba2" }}
							>
								{stats.employeeDistribution.truckDriverCount}
							</Typography>
						</Box>
					</Box>
				</Card>

				{/* Recent Employees Table */}
				{stats.recentEmployees && stats.recentEmployees.length > 0 && (
					<Card sx={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)", p: 2 }}>
						<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
							📝 Recently Added Employees
						</Typography>
						<Box
							sx={{
								overflowX: "auto",
								"& table": {
									width: "100%",
									borderCollapse: "collapse",
									fontSize: "14px",
								},
								"& th": {
									padding: "12px",
									textAlign: "left",
									fontWeight: 600,
									backgroundColor: "#f5f5f5",
									borderBottom: "2px solid #e0e0e0",
								},
								"& td": {
									padding: "12px",
									borderBottom: "1px solid #f0f0f0",
								},
								"& tbody tr:hover": {
									backgroundColor: "#f5f5f5",
								},
							}}
						>
							<table>
								<thead>
									<tr>
										<th>Name</th>
										<th>National ID</th>
										<th>Province</th>
										<th>Rank</th>
										<th>Branch</th>
										<th>Added Date</th>
									</tr>
								</thead>
								<tbody>
									{stats.recentEmployees.map((emp: any, index: number) => (
										<tr
											key={emp._id}
											style={{
												backgroundColor: index % 2 === 0 ? "#fafafa" : "white",
											}}
										>
											<td>
												{emp.firstName} {emp.lastName}
											</td>
											<td>{emp.nationalID}</td>
											<td>{emp.provinceName}</td>
											<td>{emp.rank}</td>
											<td>{emp.branch}</td>
											<td>{new Date(emp.createdAt).toLocaleDateString()}</td>
										</tr>
									))}
								</tbody>
							</table>
						</Box>
					</Card>
				)}
			</Container>
		</Box>
	);
}
