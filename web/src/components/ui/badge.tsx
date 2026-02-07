import type { ComponentProps } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BadgeVariant =
	| "default"
	| "primary"
	| "success"
	| "danger"
	| "warning"
	| "info";

type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps extends Omit<ComponentProps<"span">, "children"> {
	children: React.ReactNode;
	variant?: BadgeVariant;
	size?: BadgeSize;
	/** Render as a filled (solid) badge instead of the default soft style */
	solid?: boolean;
	/** Optional dot indicator before the label */
	dot?: boolean;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const baseClasses =
	"inline-flex items-center font-medium whitespace-nowrap rounded-full transition-colors";

const sizeClasses: Record<BadgeSize, string> = {
	sm: "px-1.5 py-0.5 text-[10px] leading-3 gap-1",
	md: "px-2 py-0.5 text-xs leading-4 gap-1",
	lg: "px-2.5 py-1 text-sm leading-4 gap-1.5",
};

const softVariantClasses: Record<BadgeVariant, string> = {
	default: "bg-surface-sunken text-text-secondary border border-border",
	primary: "bg-primary-soft text-on-primary-soft border border-primary/20",
	success: "bg-success-soft text-on-success border border-success-border",
	danger: "bg-danger-soft text-on-danger border border-danger-border",
	warning: "bg-warning-soft text-on-warning border border-warning-border",
	info: "bg-info-soft text-on-info border border-info-border",
};

const solidVariantClasses: Record<BadgeVariant, string> = {
	default: "bg-border-strong text-text-inverted border border-transparent",
	primary: "bg-primary text-on-primary border border-transparent",
	success: "bg-success text-on-primary border border-transparent",
	danger: "bg-danger text-on-primary border border-transparent",
	warning: "bg-warning text-text-inverted border border-transparent",
	info: "bg-info text-on-primary border border-transparent",
};

const dotColorClasses: Record<BadgeVariant, string> = {
	default: "bg-text-tertiary",
	primary: "bg-primary",
	success: "bg-success",
	danger: "bg-danger",
	warning: "bg-warning",
	info: "bg-info",
};

const solidDotColorClasses: Record<BadgeVariant, string> = {
	default: "bg-text-inverted/60",
	primary: "bg-on-primary/60",
	success: "bg-on-primary/60",
	danger: "bg-on-primary/60",
	warning: "bg-text-inverted/60",
	info: "bg-on-primary/60",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Badge({
	children,
	variant = "default",
	size = "md",
	solid = false,
	dot = false,
	className = "",
	...rest
}: BadgeProps) {
	const variantClasses = solid
		? solidVariantClasses[variant]
		: softVariantClasses[variant];

	const dotClasses = solid
		? solidDotColorClasses[variant]
		: dotColorClasses[variant];

	const dotSizeClasses: Record<BadgeSize, string> = {
		sm: "h-1 w-1",
		md: "h-1.5 w-1.5",
		lg: "h-2 w-2",
	};

	return (
		<span
			className={`${baseClasses} ${sizeClasses[size]} ${variantClasses} ${className}`}
			{...rest}
		>
			{dot && (
				<span
					className={`shrink-0 rounded-full ${dotSizeClasses[size]} ${dotClasses}`}
					aria-hidden="true"
				/>
			)}
			{children}
		</span>
	);
}
