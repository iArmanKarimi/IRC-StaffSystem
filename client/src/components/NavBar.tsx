import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LogoutIcon from "@mui/icons-material/Logout";
import { authApi } from "../api/api";
import { ROUTES } from "../const/endpoints";

type NavBarProps = {
	title?: string;
	showLogout?: boolean;
};

export default function NavBar({
	title = "IRC Staff System",
	showLogout = true,
}: NavBarProps) {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	const handleLogout = async () => {
		setLoading(true);
		try {
			await authApi.logout();
			navigate(ROUTES.ROOT, { replace: true });
		} catch (err) {
			console.error("Logout failed:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<AppBar position="static" color="primary">
			<Toolbar sx={{ minHeight: 64 }}>
				<Typography
					variant="h6"
					component="h1"
					sx={{
						flexGrow: 1,
						fontWeight: 600,
						letterSpacing: "0.02em",
						color: "white",
					}}
				>
					{title}
				</Typography>
				{showLogout && (
					<Button
						color="inherit"
						variant="outlined"
						onClick={handleLogout}
						disabled={loading}
						startIcon={<LogoutIcon />}
						sx={{
							borderColor: "rgba(255, 255, 255, 0.3)",
							"&:hover": {
								borderColor: "rgba(255, 255, 255, 0.5)",
								backgroundColor: "rgba(255, 255, 255, 0.1)",
							},
						}}
					>
						{loading ? "Logging out..." : "Logout"}
					</Button>
				)}
			</Toolbar>
		</AppBar>
	);
}
