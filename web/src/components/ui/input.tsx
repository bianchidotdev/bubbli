import { forwardRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type InputSize = "sm" | "md" | "lg";

interface InputProps extends Omit<React.ComponentProps<"input">, "size"> {
	/** Visual size variant */
	size?: InputSize;
	/** Error state — adds danger styling */
	error?: boolean;
	/** Optional leading icon or element */
	leadingAddon?: React.ReactNode;
	/** Optional trailing icon or element */
	trailingAddon?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const sizeClasses: Record<InputSize, string> = {
	sm: "h-8 px-2.5 text-xs",
	md: "h-10 px-3.5 text-sm",
	lg: "h-12 px-4 text-base",
};

const sizeClassesWithLeading: Record<InputSize, string> = {
	sm: "pl-8",
	md: "pl-10",
	lg: "pl-12",
};

const sizeClassesWithTrailing: Record<InputSize, string> = {
	sm: "pr-8",
	md: "pr-10",
	lg: "pr-12",
};

const addonSizeClasses: Record<InputSize, string> = {
	sm: "h-4 w-4",
	md: "h-4.5 w-4.5",
	lg: "h-5 w-5",
};

const baseClasses = [
	"block w-full rounded-lg",
	"border bg-surface text-text shadow-sm",
	"transition-all duration-[var(--duration-normal)]",
	"placeholder:text-text-placeholder",
	"focus:outline-none focus:ring-2",
	"disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

const stateClasses = {
	default: "border-border-strong focus:border-border-focus focus:ring-ring",
	error: "border-danger focus:border-danger focus:ring-danger/20",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			size = "md",
			error = false,
			leadingAddon,
			trailingAddon,
			className = "",
			...rest
		},
		ref,
	) => {
		const hasLeading = !!leadingAddon;
		const hasTrailing = !!trailingAddon;

		const inputClasses = [
			baseClasses,
			sizeClasses[size],
			error ? stateClasses.error : stateClasses.default,
			hasLeading ? sizeClassesWithLeading[size] : "",
			hasTrailing ? sizeClassesWithTrailing[size] : "",
			className,
		]
			.filter(Boolean)
			.join(" ");

		if (!hasLeading && !hasTrailing) {
			return <input ref={ref} className={inputClasses} {...rest} />;
		}

		return (
			<div className="relative">
				{hasLeading && (
					<span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-placeholder">
						<span className={addonSizeClasses[size]}>{leadingAddon}</span>
					</span>
				)}

				<input ref={ref} className={inputClasses} {...rest} />

				{hasTrailing && (
					<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-text-placeholder">
						<span className={addonSizeClasses[size]}>{trailingAddon}</span>
					</span>
				)}
			</div>
		);
	},
);

Input.displayName = "Input";

export { Input };
export type { InputProps, InputSize };
