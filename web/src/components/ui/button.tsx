import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Spinner } from "./spinner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ButtonVariant =
	| "primary"
	| "secondary"
	| "ghost"
	| "danger"
	| "accent";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	/** Show a loading spinner and disable the button */
	loading?: boolean;
	/** Optional icon rendered before children */
	iconLeft?: React.ReactNode;
	/** Optional icon rendered after children */
	iconRight?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Style maps
// ---------------------------------------------------------------------------

const variantClasses: Record<ButtonVariant, string> = {
	primary: [
		"bg-primary text-on-primary",
		"hover:bg-primary-hover",
		"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
		"active:scale-[0.98]",
		"shadow-sm",
	].join(" "),

	secondary: [
		"bg-surface text-text border border-border-strong",
		"hover:bg-surface-sunken",
		"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
		"active:scale-[0.98]",
		"shadow-sm",
	].join(" "),

	ghost: [
		"bg-transparent text-text-secondary",
		"hover:bg-surface-sunken hover:text-text",
		"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
		"active:scale-[0.98]",
	].join(" "),

	danger: [
		"bg-danger text-on-primary",
		"hover:brightness-110",
		"focus-visible:ring-2 focus-visible:ring-danger/30 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
		"active:scale-[0.98]",
		"shadow-sm",
	].join(" "),

	accent: [
		"bg-accent text-on-primary",
		"hover:bg-accent-hover",
		"focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
		"active:scale-[0.98]",
		"shadow-sm",
	].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
	sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
	md: "px-4 py-2.5 text-sm gap-2 rounded-lg",
	lg: "px-6 py-3 text-base gap-2 rounded-xl",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	function Button(
		{
			variant = "primary",
			size = "md",
			loading = false,
			disabled,
			iconLeft,
			iconRight,
			children,
			className = "",
			...rest
		},
		ref,
	) {
		const isDisabled = disabled || loading;

		return (
			<button
				ref={ref}
				type="button"
				disabled={isDisabled}
				className={[
					"inline-flex items-center justify-center font-semibold",
					"transition-all duration-150 ease-out",
					"outline-none",
					"disabled:cursor-not-allowed disabled:opacity-60",
					variantClasses[variant],
					sizeClasses[size],
					className,
				]
					.filter(Boolean)
					.join(" ")}
				{...rest}
			>
				{loading ? (
					<Spinner
						size={size === "sm" ? "xs" : "sm"}
						className={
							variant === "primary" ||
							variant === "danger" ||
							variant === "accent"
								? "text-on-primary"
								: "text-text-tertiary"
						}
					/>
				) : iconLeft ? (
					<span className="shrink-0">{iconLeft}</span>
				) : null}
				{children}
				{!loading && iconRight ? (
					<span className="shrink-0">{iconRight}</span>
				) : null}
			</button>
		);
	},
);
