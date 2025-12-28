import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

type ConfirmDialogProps = {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	loading?: boolean;
	confirmLabel?: string;
	cancelLabel?: string;
	confirmColor?:
		| "inherit"
		| "primary"
		| "secondary"
		| "error"
		| "info"
		| "success"
		| "warning";
};

/**
 * Reusable confirmation dialog
 * Used for destructive actions like delete operations
 */
export function ConfirmDialog({
	open,
	onClose,
	onConfirm,
	title,
	message,
	loading = false,
	confirmLabel = "تأیید",
	cancelLabel = "لغو",
	confirmColor = "error",
}: ConfirmDialogProps) {
	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>{title}</DialogTitle>
			<DialogContent>
				<DialogContentText>{message}</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={loading}>
					{cancelLabel}
				</Button>
				<Button
					onClick={onConfirm}
					variant="contained"
					color={confirmColor}
					disabled={loading}
				>
					{loading ? "در حال پردازش..." : confirmLabel}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
