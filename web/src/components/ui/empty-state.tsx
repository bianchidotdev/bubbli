import { type ComponentProps, isValidElement, type ReactNode } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EmptyStateSize = "sm" | "md" | "lg";

interface EmptyStateProps extends Omit<ComponentProps<"div">, "title"> {
	/** SVG path(s) or a full ReactNode to render inside the icon circle */
	icon?: ReactNode;
	/** Heading text */
	title: string;
	/** Supporting copy below the title */
	description?: string;
	/** Optional action area (e.g. a Button or link) rendered below the text */
	action?: ReactNode;
	/** Controls spacing and icon/text sizing */
	size?: EmptyStateSize;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const sizePadding: Record<EmptyStateSize, string> = {
	sm: "py-6",
	md: "py-8",
	lg: "py-12",
};

const iconCircleSize: Record<EmptyStateSize, string> = {
	sm: "h-10 w-10",
	md: "h-12 w-12",
	lg: "h-14 w-14",
};

const iconSvgSize: Record<EmptyStateSize, string> = {
	sm: "h-5 w-5",
	md: "h-6 w-6",
	lg: "h-7 w-7",
};

const titleSize: Record<EmptyStateSize, string> = {
	sm: "text-sm",
	md: "text-sm",
	lg: "text-lg",
};

const descriptionSize: Record<EmptyStateSize, string> = {
	sm: "text-xs",
	md: "text-xs",
	lg: "text-sm",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * If `icon` is a raw SVG primitive element (e.g. a `<path>`), wrap it in a
 * standard `<svg>` container. If it's already a complete node (e.g. a full
 * `<svg>` or a custom component), render it as-is.
 */
function renderIcon(icon: ReactNode, size: EmptyStateSize): ReactNode {
	if (
		isValidElement(icon) &&
		typeof icon.type === "string" &&
		/^[a-z]/.test(icon.type)
	) {
		return (
			<svg
				className={`${iconSvgSize[size]} text-text-placeholder`}
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth={1.5}
			>
				{icon}
			</svg>
		);
	}

	return icon;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EmptyState({
	icon,
	title,
	description,
	action,
	size = "md",
	className = "",
	...rest
}: EmptyStateProps) {
	return (
		<div
			className={`flex flex-col items-center text-center ${sizePadding[size]} ${className}`}
			{...rest}
		>
			{icon && (
				<div
					className={`flex items-center justify-center rounded-full bg-surface-sunken ${iconCircleSize[size]}`}
				>
					{renderIcon(icon, size)}
				</div>
			)}

			<h3
				className={`font-semibold text-text ${titleSize[size]} ${icon ? "mt-3" : ""}`}
			>
				{title}
			</h3>

			{description && (
				<p
					className={`mt-1 max-w-xs text-text-tertiary ${descriptionSize[size]}`}
				>
					{description}
				</p>
			)}

			{action && <div className="mt-4">{action}</div>}
		</div>
	);
}
