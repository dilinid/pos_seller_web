import React from "react";

export interface SelectOption {
	value: string;
	label: string;
}

interface SelectProps {
	id: string;
	name?: string;
	value: string;
	onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
	options: SelectOption[];
	placeholder?: string;
	className?: string;
	disabled?: boolean;
	required?: boolean;
}

const Select: React.FC<SelectProps> = ({
	id,
	name,
	value,
	onChange,
	options,
	placeholder,
	className = "form-input",
	disabled = false,
	required = false,
}) => {
	return (
		<select
			id={id}
			name={name || id}
			value={value}
			onChange={onChange}
			className={className}
			disabled={disabled}
			required={required}
			style={{
				padding: "12px 14px",
				appearance: "none",
				WebkitAppearance: "none",
				MozAppearance: "none",
				backgroundImage:
					"url('data:image/svg+xml;utf8,<svg width=\"10\" height=\"6\" viewBox=\"0 0 10 6\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M0.5 0.75L5 5.25L9.5 0.75\" stroke=\"%23666\" stroke-width=\"1.2\" stroke-linecap=\"round\"/></svg>')",
				backgroundRepeat: "no-repeat",
				backgroundPosition: "right 14px center",
				backgroundSize: "10px 6px",
			}}
		>
			{placeholder && (
				<option value="" disabled>
					{placeholder}
				</option>
			)}
			{options.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	);
};

export default Select;
