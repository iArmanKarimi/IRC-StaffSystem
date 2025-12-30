import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material/TextField";

interface PersianDateInputProps extends Omit<TextFieldProps, "type"> {
	value: string;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	label: string;
	required?: boolean;
}

/**
 * Persian Date Input Component
 * Text input for entering dates in YYYY-MM-DD format (Gregorian)
 */
export function PersianDateInput({
	value,
	onChange,
	label,
	required,
	...props
}: PersianDateInputProps) {
	return (
		<TextField
			{...props}
			label={label}
			type="text"
			required={required}
			value={value}
			onChange={onChange}
			placeholder="مثال: 2025-12-30"
			helperText="فرمت تاریخ: سال-ماه-روز (میلادی) مثال: 2025-12-30"
			FormHelperTextProps={{
				sx: { textAlign: "right", fontSize: "0.75rem" },
			}}
		/>
	);
}
