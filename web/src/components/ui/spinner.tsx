import type { ComponentProps } from "react";

type SpinnerSize = "xs" | "sm" | "md" | "lg";

interface SpinnerProps extends Omit<ComponentProps<"output">, "children"> {
	/** Visual size of the spinner */
	size?: SpinnerSize;
	/** Accessible label for screen readers */
	label?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
	xs: "h-3 w-3 border-[1.5px]",
	sm: "h-4 w-4 border-2",
	md: "h-6 w-6 border-2",
	lg: "h-8 w-8 border-[3px]",
};

export function Spinner({
	size = "md",
	label = "Loading…",
	className = "",
	...rest
}: SpinnerProps) {
	return (
		<output
			aria-label={label}
			data-no-theme-transition
			className={`inline-flex items-center justify-center ${className}`}
			{...rest}
		>
			<span
				className={`animate-spin rounded-full border-primary/30 border-t-primary ${sizeClasses[size]}`}
			/>
			<span className="sr-only">{label}</span>
		</output>
	);
}
