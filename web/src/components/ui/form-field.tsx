import type { ReactNode } from "react";

interface FormFieldProps {
	label: string;
	htmlFor: string;
	hint?: string;
	error?: string;
	children: ReactNode;
}

export function FormField({
	label,
	htmlFor,
	hint,
	error,
	children,
}: FormFieldProps) {
	return (
		<div>
			<div className="flex items-baseline justify-between">
				<label
					htmlFor={htmlFor}
					className="block text-sm font-medium text-text"
				>
					{label}
				</label>
				{hint && !error && (
					<span className="text-xs text-text-placeholder">{hint}</span>
				)}
				{error && (
					<span className="text-xs font-medium text-danger">{error}</span>
				)}
			</div>
			<div className="mt-1.5">{children}</div>
		</div>
	);
}
