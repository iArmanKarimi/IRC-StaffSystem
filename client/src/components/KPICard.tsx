import {
	Card,
	CardContent,
	Typography,
	Box,
	Tooltip,
	useTheme,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

interface KPICardProps {
	title: string;
	value: string | number;
	unit?: string;
	color?: "primary" | "success" | "warning" | "error" | "info";
	tooltip?: string;
	loading?: boolean;
}

export function KPICard({
	title,
	value,
	unit = "",
	color = "primary",
	tooltip,
	loading = false,
}: KPICardProps) {
	const theme = useTheme();
	const colorMap = {
		primary: theme.palette.primary.main,
		success: theme.palette.success.main,
		warning: theme.palette.warning.main,
		error: theme.palette.error.main,
		info: theme.palette.info.main,
	};

	return (
		<Card
			sx={{
				borderRadius: 2,
				boxShadow: 1,
				transition: "all 0.3s ease",
				"&:hover": {
					boxShadow: 3,
					transform: "translateY(-2px)",
				},
			}}
			role="region"
			aria-label={`${title}: ${value}${unit ? ` ${unit}` : ""}`}
			tabIndex={0}
		>
			<CardContent>
				<Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
					<Typography
						variant="subtitle2"
						color="text.secondary"
						sx={{ fontWeight: 600 }}
					>
						{title}
					</Typography>
					{tooltip && (
						<Tooltip title={tooltip} arrow>
							<InfoIcon sx={{ fontSize: "1.2rem", color: "text.secondary" }} />
						</Tooltip>
					)}
				</Box>
				<Typography
					variant="h4"
					sx={{
						fontWeight: 700,
						color: colorMap[color],
						mb: 0.5,
					}}
				>
					{loading ? "—" : value}
				</Typography>
				{unit && (
					<Typography variant="caption" color="text.secondary">
						{unit}
					</Typography>
				)}
			</CardContent>
		</Card>
	);
}
