import { forwardRef, type SelectHTMLAttributes } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SelectVariant = "default" | "ghost";
type SelectSize = "sm" | "md" | "lg";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	variant?: SelectVariant;
	selectSize?: SelectSize;
	error?: boolean;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const baseClasses = [
	"block w-full appearance-none",
	"bg-surface text-text",
	"border transition-all",
	"focus:border-border-focus focus:ring-2 focus:ring-ring focus:outline-none",
	"disabled:cursor-not-allowed disabled:opacity-60",
].join(" ");

const variantClasses: Record<SelectVariant, string> = {
	default: "border-border-strong shadow-sm",
	ghost: "border-transparent bg-transparent hover:bg-surface-sunken",
};

const sizeClasses: Record<SelectSize, string> = {
	sm: "rounded-md pl-2.5 pr-8 py-1.5 text-xs",
	md: "rounded-lg pl-3.5 pr-10 py-2.5 text-sm",
	lg: "rounded-lg pl-4 pr-10 py-3 text-base",
};

const errorClasses = "border-danger focus:border-danger focus:ring-danger/20";

// ---------------------------------------------------------------------------
// Chevron icon component
// ---------------------------------------------------------------------------

function ChevronIcon({ className = "" }: { className?: string }) {
	return (
		<svg
			className={`pointer-events-none text-text-placeholder ${className}`}
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			strokeWidth={2}
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M19.5 8.25l-7.5 7.5-7.5-7.5"
			/>
		</svg>
	);
}

const chevronSizeClasses: Record<SelectSize, string> = {
	sm: "h-3.5 w-3.5 right-2",
	md: "h-4 w-4 right-3",
	lg: "h-5 w-5 right-3",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const Select = forwardRef<HTMLSelectElement, SelectProps>(
	(
		{
			variant = "default",
			selectSize = "md",
			error = false,
			className = "",
			children,
			...rest
		},
		ref,
	) => {
		const classes = [
			baseClasses,
			variantClasses[variant],
			sizeClasses[selectSize],
			error ? errorClasses : "",
			className,
		]
			.filter(Boolean)
			.join(" ");

		return (
			<div className="relative">
				<select ref={ref} className={classes} {...rest}>
					{children}
				</select>
				<span
					className={`absolute inset-y-0 flex items-center ${chevronSizeClasses[selectSize]}`}
					aria-hidden="true"
				>
					<ChevronIcon
						className={chevronSizeClasses[selectSize]
							.split(" ")
							.slice(0, 2)
							.join(" ")}
					/>
				</span>
			</div>
		);
	},
);

Select.displayName = "Select";

export { Select, type SelectProps, type SelectVariant, type SelectSize };
