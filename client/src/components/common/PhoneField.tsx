import React from "react";
import { TextField, type TextFieldProps } from "@mui/material";

type PhoneFieldProps = TextFieldProps & {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function PhoneField({ value, onChange, ...props }: PhoneFieldProps) {
	const handleInvalidPhone = (e: React.InvalidEvent<HTMLInputElement>) => {
		e.currentTarget.setCustomValidity(
			"شماره تماس باید ۱۱ رقم و با 09 شروع شود",
		);
	};

	const clearCustomValidity = (e: React.SyntheticEvent<HTMLInputElement>) => {
		e.currentTarget.setCustomValidity("");
	};

	return (
		<TextField
			label="شماره تماس"
			required
			slotProps={{
				htmlInput: {
					maxLength: 11,
					pattern: "^09\\d{9}$",
					inputMode: "numeric",
					onInvalid: handleInvalidPhone,
					onInput: clearCustomValidity,
				},
			}}
			value={value}
			onChange={onChange}
			{...props}
		/>
	);
}
