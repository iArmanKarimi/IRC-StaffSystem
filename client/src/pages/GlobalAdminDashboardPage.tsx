import { Link } from "react-router-dom";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from "@mui/material/CardActionArea";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import WarningIcon from "@mui/icons-material/Warning";
import { ROUTES } from "../const/endpoints";
import NavBar from "../components/NavBar";
import { useProvinces } from "../hooks/useProvinces";
import { provinceApi, globalApi } from "../api/api";
import { LoadingView } from "../components/states/LoadingView";
import { ErrorView } from "../components/states/ErrorView";
import { EmptyState } from "../components/states/EmptyState";
import { useState, useEffect } from "react";
import { CardActions } from "@mui/material";

export default function GlobalAdminDashboardPage() {
	const { provinces, loading, error, refetch } = useProvinces();
	const [clearing, setClearing] = useState(false);
	const [togglingProvinceId, setTogglingProvinceId] = useState<string | null>(
		null,
	);
	const [bulkLocking, setBulkLocking] = useState<"lock" | "unlock" | null>(null);
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [countdown, setCountdown] = useState(5);
	const [toastOpen, setToastOpen] = useState(false);
	const [toastMessage, setToastMessage] = useState("");
	const [toastSeverity, setToastSeverity] = useState<
		"success" | "error" | "warning"
	>("success");

	// Countdown timer effect (only for clear dialog)
	useEffect(() => {
		if (confirmDialogOpen && countdown > 0) {
			const timer = setTimeout(() => {
				setCountdown((prev) => prev - 1);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [confirmDialogOpen, countdown]);

	// Auto-close toast after 4 seconds
	useEffect(() => {
		if (toastOpen) {
			const timer = setTimeout(() => {
				setToastOpen(false);
			}, 4000);
			return () => clearTimeout(timer);
		}
	}, [toastOpen]);

	const handleExportAllEmployees = async () => {
		try {
			const blob = await globalApi.exportAllEmployees();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute(
				"download",
				`employees_all_${new Date().toISOString().split("T")[0]}.xlsx`,
			);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (err) {
			console.error("Export failed:", err);
			setToastMessage("❌ خروجی کارمندان ناموفق بود");
			setToastSeverity("error");
			setToastOpen(true);
		}
	};

	const handleOpenClearDialog = () => {
		setCountdown(5);
		setConfirmDialogOpen(true);
	};

	const handleCloseClearDialog = () => {
		setConfirmDialogOpen(false);
		setCountdown(5);
	};

	const handleToggleLockClick = async (
		provinceId: string,
		provinceName: string,
		isLocked: boolean,
	) => {
		setTogglingProvinceId(provinceId);
		setToastOpen(false);
		try {
			const response = await provinceApi.toggleLock(provinceId);
			const newStatus = response.data?.is_locked ?? !isLocked;
			await refetch();
			setToastMessage(
				newStatus
					? `🔒 عملکرد استان ${provinceName} قفل شد`
					: `🔓 عملکرد استان ${provinceName} باز شد`,
			);
			setToastSeverity(newStatus ? "warning" : "success");
			setToastOpen(true);
		} catch (err: any) {
			const errorMessage =
				err?.response?.data?.error ||
				err?.response?.data?.message ||
				err?.message ||
				"تغییر وضعیت ناموفق بود";
			setToastMessage(`❌ ${errorMessage}`);
			setToastSeverity("error");
			setToastOpen(true);
		} finally {
			setTogglingProvinceId(null);
		}
	};

	const handleClearAllPerformances = async () => {
		handleCloseClearDialog();
		setClearing(true);
		try {
			const response = await provinceApi.clearAllPerformances();
			setToastMessage(
				`داده‌های عملکرد ${
					response.data?.modifiedCount || 0
				} کارمند با موفقیت بازنشانی شد`,
			);
			setToastSeverity("success");
			setToastOpen(true);
		} catch (err: any) {
			console.error("Reset performances failed:", err);
			const errorMessage =
				err?.response?.data?.error ||
				err?.response?.data?.message ||
				err?.message ||
				"خطای نامشخص";
			setToastMessage(`بازنشانی عملکرد کارمندان ناموفق بود: ${errorMessage}`);
			setToastSeverity("error");
			setToastOpen(true);
		} finally {
			setClearing(false);
		}
	};

	const handleBulkProvinceLock = async (locked: boolean) => {
		setBulkLocking(locked ? "lock" : "unlock");
		setToastOpen(false);
		try {
			const response = await provinceApi.setAllLocks(locked);
			await refetch();
			setToastMessage(
				locked
					? `🔒 همه استان‌ها قفل شدند (${response.data?.modifiedCount || 0} تغییر)`
					: `🔓 همه استان‌ها باز شدند (${response.data?.modifiedCount || 0} تغییر)`,
			);
			setToastSeverity(locked ? "warning" : "success");
			setToastOpen(true);
		} catch (err: any) {
			const errorMessage =
				err?.response?.data?.error ||
				err?.response?.data?.message ||
				err?.message ||
				"تغییر وضعیت همه استان‌ها ناموفق بود";
			setToastMessage(`❌ ${errorMessage}`);
			setToastSeverity("error");
			setToastOpen(true);
		} finally {
			setBulkLocking(null);
		}
	};

	if (loading) {
		return <LoadingView title="استان‌ها - مدیر کل" />;
	}

	if (error) {
		return (
			<ErrorView title="استان‌ها - مدیر کل" message={error} onRetry={refetch} />
		);
	}

	if (!provinces.length) {
		return (
			<>
				<NavBar title="استان‌ها - مدیر کل" />
				<Container sx={{ mt: 4 }}>
					<EmptyState message="هیچ استانی یافت نشد." />
				</Container>
			</>
		);
	}

	return (
		<>
			<NavBar title="استان‌ها - مدیر کل" />
			<Container sx={{ py: 4 }}>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
					sx={{ mb: 3 }}
				>
					<Typography variant="h4" component="h1" gutterBottom sx={{ m: 0 }}>
						استان‌ها
					</Typography>
					<Stack
						direction="row"
						spacing={1.5}
						alignItems="center"
						sx={{ flexWrap: "wrap" }}
					>
						<Button
							onClick={() => handleBulkProvinceLock(true)}
							variant="outlined"
							color="warning"
							startIcon={<LockIcon />}
							disabled={bulkLocking !== null}
							size="small"
						>
							{bulkLocking === "lock" ? "در حال قفل کردن..." : "قفل کردن همه"}
						</Button>
						<Button
							onClick={() => handleBulkProvinceLock(false)}
							variant="outlined"
							color="success"
							startIcon={<LockOpenIcon />}
							disabled={bulkLocking !== null}
							size="small"
						>
							{bulkLocking === "unlock"
								? "در حال باز کردن..."
								: "باز کردن همه"}
						</Button>
						<Button
							onClick={handleOpenClearDialog}
							variant="outlined"
							color="error"
							startIcon={<DeleteSweepIcon />}
							disabled={clearing}
							size="small"
						>
							{clearing ? "در حال بازنشانی..." : "بازنشانی همه"}
						</Button>
						<Button
							onClick={handleExportAllEmployees}
							variant="contained"
							color="primary"
							startIcon={<FileDownloadIcon />}
							size="small"
						>
							خروجی اکسل
						</Button>
					</Stack>
				</Stack>

				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: {
							xs: "repeat(4, minmax(0, 1fr))",
							sm: "repeat(5, minmax(0, 1fr))",
							md: "repeat(6, minmax(0, 1fr))",
							lg: "repeat(8, minmax(0, 1fr))",
						},
						gap: 1,
					}}
				>
					{provinces.map((province) => (
						<Card
							key={province._id}
							sx={{
								height: "100%",
								display: "flex",
								flexDirection: "column",
								transition: "all 0.3s ease-in-out",
								"&:hover": {
									transform: "translateY(-4px)",
									boxShadow: 4,
								},
							}}
						>
							<CardActionArea
								component={Link}
								to={ROUTES.PROVINCE_EMPLOYEES.replace(
									":provinceId",
									province._id,
								)}
								sx={{
									height: "100%",
									display: "flex",
									flexDirection: "column",
									alignItems: "stretch",
									flexGrow: 1,
								}}
							>
								<Box sx={{ position: "relative", width: "100%", pt: "80%" }}>
									{province.imageUrl ? (
										<CardMedia
											component="img"
											image={province.imageUrl}
											alt={province.name ?? "Province image"}
											sx={{
												position: "absolute",
												top: 0,
												left: 0,
												width: "100%",
												height: "100%",
												objectFit: "cover",
											}}
										/>
									) : (
										<Stack
											sx={{
												position: "absolute",
												top: 0,
												left: 0,
												width: "100%",
												height: "100%",
												bgcolor: "grey.100",
											}}
											alignItems="center"
											justifyContent="center"
										>
											<Avatar
												sx={{
													width: 40,
													height: 40,
													bgcolor: "primary.main",
												}}
											>
												{province.name?.charAt(0) ?? "?"}
											</Avatar>
										</Stack>
									)}
								</Box>
								<CardContent sx={{ flexGrow: 1, width: "100%", py: 1, px: 1 }}>
									<Typography variant="body2" component="div" noWrap>
										{province.name ?? "بدون نام"}
									</Typography>
								</CardContent>
							</CardActionArea>
							<Box sx={{ p: 1, pt: 0 }} onClick={(e) => e.stopPropagation()}>
								<Button
									fullWidth
									size="small"
									variant={province.is_locked ? "outlined" : "contained"}
									color={province.is_locked ? "success" : "info"}
									startIcon={
										province.is_locked ? <LockOpenIcon /> : <LockIcon />
									}
									onClick={(e) => {
										e.stopPropagation();
										handleToggleLockClick(
											province._id,
											province.name,
											province.is_locked,
										);
									}}
									disabled={togglingProvinceId === province._id}
								>
									{togglingProvinceId === province._id
										? "در حال تغییر..."
										: province.is_locked
											? "باز کردن"
											: "قفل کردن"}
								</Button>
							</Box>
						</Card>
					))}
				</Box>

				{/* Confirm Clear Performances Dialog */}
				<Dialog
					open={confirmDialogOpen}
					onClose={handleCloseClearDialog}
					maxWidth="sm"
					fullWidth
				>
					<DialogTitle>
						<Stack direction="row" alignItems="center" spacing={1}>
							<WarningIcon color="error" />
							<Typography>بازنشانی عملکرد همه کارمندان</Typography>
						</Stack>
					</DialogTitle>
					<DialogContent>
						<DialogContentText>
							<strong>هشدار:</strong> شما در شرف بازنشانی تمام داده‌های عملکرد
							برای همه کارمندان در تمام استان‌ها به مقادیر پیش‌فرض هستید. این
							عمل قابل بازگشت نیست.
						</DialogContentText>
						<DialogContentText sx={{ mt: 2 }}>
							این عمل فیلدهای زیر را به صفر/پیش‌فرض بازنشانی می‌کند:
						</DialogContentText>
						<Box component="ul" sx={{ mt: 1, color: "text.secondary" }}>
							<li>امتیازات عملکرد روزانه (بازنشانی به ۰)</li>
							<li>اطلاعات شیفت (بازنشانی به ۰ شیفت، مدت ۸ ساعت)</li>
							<li>سوابق اضافه‌کاری (بازنشانی به ۰)</li>
							<li>داده‌های مرخصی و غیبت (همه به ۰ بازنشانی می‌شوند)</li>
							<li>وضعیت (بازنشانی به "فعال") و یادداشت‌ها (پاک شده)</li>
						</Box>
						{countdown > 0 && (
							<DialogContentText
								sx={{ mt: 2, fontWeight: "bold", color: "error.main" }}
							>
								لطفاً {countdown} ثانیه قبل از تأیید صبر کنید...
							</DialogContentText>
						)}
					</DialogContent>
					<DialogActions>
						<Button onClick={handleCloseClearDialog} color="inherit">
							لغو
						</Button>
						<Button
							onClick={handleClearAllPerformances}
							color="error"
							variant="contained"
							disabled={countdown > 0}
							startIcon={<DeleteSweepIcon />}
						>
							تأیید بازنشانی همه
						</Button>
					</DialogActions>
				</Dialog>

				{/* Toast Notification */}
				{toastOpen && (
					<Box
						sx={{
							position: "fixed",
							bottom: 20,
							right: 20,
							zIndex: 1400,
						}}
					>
						<Alert
							severity={toastSeverity}
							onClose={() => setToastOpen(false)}
							sx={{ boxShadow: 2 }}
						>
							{toastMessage}
						</Alert>
					</Box>
				)}
			</Container>
		</>
	);
}
