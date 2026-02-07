import type { ComponentProps, ReactNode } from "react";

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

type CardVariant = "raised" | "flat" | "outlined";

interface CardProps extends ComponentProps<"div"> {
	variant?: CardVariant;
}

const variantClasses: Record<CardVariant, string> = {
	raised:
		"bg-surface-raised border border-border shadow-sm hover:shadow-md transition-shadow",
	flat: "bg-surface-raised",
	outlined: "bg-surface-raised border border-border",
};

export function Card({
	variant = "outlined",
	className = "",
	children,
	...rest
}: CardProps) {
	return (
		<div
			className={`overflow-hidden rounded-2xl ${variantClasses[variant]} ${className}`}
			{...rest}
		>
			{children}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Card.Header
// ---------------------------------------------------------------------------

interface CardHeaderProps extends ComponentProps<"div"> {
	heading?: ReactNode;
	description?: ReactNode;
	action?: ReactNode;
}

function CardHeader({
	heading,
	description,
	action,
	className = "",
	children,
	...rest
}: CardHeaderProps) {
	// If children are passed directly, render them as-is
	if (children) {
		return (
			<div
				className={`border-b border-border px-6 py-4 ${className}`}
				{...rest}
			>
				{children}
			</div>
		);
	}

	return (
		<div className={`border-b border-border px-6 py-4 ${className}`} {...rest}>
			<div className="flex items-center justify-between gap-4">
				<div className="min-w-0">
					{heading && (
						<h3 className="truncate text-base font-semibold text-text">
							{heading}
						</h3>
					)}
					{description && (
						<p className="mt-0.5 truncate text-sm text-text-secondary">
							{description}
						</p>
					)}
				</div>
				{action && <div className="shrink-0">{action}</div>}
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Card.Body
// ---------------------------------------------------------------------------

interface CardBodyProps extends ComponentProps<"div"> {
	padded?: boolean;
}

function CardBody({
	padded = true,
	className = "",
	children,
	...rest
}: CardBodyProps) {
	return (
		<div className={`${padded ? "px-6 py-5" : ""} ${className}`} {...rest}>
			{children}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Card.Footer
// ---------------------------------------------------------------------------

interface CardFooterProps extends ComponentProps<"div"> {
	align?: "left" | "center" | "right" | "between";
}

const alignClasses: Record<string, string> = {
	left: "justify-start",
	center: "justify-center",
	right: "justify-end",
	between: "justify-between",
};

function CardFooter({
	align = "right",
	className = "",
	children,
	...rest
}: CardFooterProps) {
	return (
		<div
			className={`flex items-center gap-3 border-t border-border px-6 py-4 ${alignClasses[align]} ${className}`}
			{...rest}
		>
			{children}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Attach sub-components
// ---------------------------------------------------------------------------

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
