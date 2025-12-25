import { Link } from "react-router-dom";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import PeopleIcon from "@mui/icons-material/People";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { ROUTES } from "../const/endpoints";
import NavBar from "../components/NavBar";
import { useProvinces } from "../hooks/useProvinces";
import { LoadingView } from "../components/states/LoadingView";
import { ErrorView } from "../components/states/ErrorView";
import { EmptyState } from "../components/states/EmptyState";
import { API_BASE_URL } from "../const/endpoints";

export default function GlobalAdminDashboardPage() {
	const { provinces, loading, error, refetch } = useProvinces();

	const handleExportAllEmployees = async () => {
		try {
			// Call export endpoint for each province and combine or use a global export endpoint
			// For now, we'll create a download link for all provinces combined
			const response = await fetch(`${API_BASE_URL}/employees/export-all`, {
				method: "GET",
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to export employees");
			}

			// Get the blob from response
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute(
				"download",
				`employees_all_${new Date().toISOString().split("T")[0]}.xlsx`
			);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (err) {
			console.error("Export failed:", err);
			alert("Failed to export employees");
		}
	};

	if (loading) {
		return <LoadingView title="Provinces - Global Admin" />;
	}

	if (error) {
		return (
			<ErrorView
				title="Provinces - Global Admin"
				message={error}
				onRetry={refetch}
			/>
		);
	}

	if (!provinces.length) {
		return (
			<>
				<NavBar title="Provinces - Global Admin" />
				<Container sx={{ mt: 4 }}>
					<EmptyState message="No provinces found." />
				</Container>
			</>
		);
	}

	return (
		<>
			<NavBar title="Provinces - Global Admin" />
			<Container sx={{ py: 4 }}>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
					sx={{ mb: 3 }}
				>
					<Typography variant="h4" component="h1" gutterBottom sx={{ m: 0 }}>
						Provinces
					</Typography>
					<Button
						onClick={handleExportAllEmployees}
						variant="outlined"
						color="primary"
						startIcon={<FileDownloadIcon />}
					>
						Export All Employees
					</Button>
				</Stack>

				<TableContainer component={Paper}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Name</TableCell>
								<TableCell>Admin</TableCell>
								<TableCell align="right">Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{provinces.map((province) => (
								<TableRow
									key={province._id}
									sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
								>
									<TableCell component="th" scope="row">
										{province.name ?? "Unnamed"}
									</TableCell>
									<TableCell>
										{typeof province.admin === "object" &&
										province.admin &&
										"username" in province.admin
											? (province.admin as { username?: string }).username ??
											  "(unknown)"
											: "(not set)"}
									</TableCell>
									<TableCell align="right">
										<Button
											component={Link}
											to={ROUTES.PROVINCE_EMPLOYEES.replace(
												":provinceId",
												province._id
											)}
											variant="outlined"
											size="small"
											startIcon={<PeopleIcon />}
										>
											View Employees
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</Container>
		</>
	);
}
