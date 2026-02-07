import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AlertStatus = "error" | "success" | "warning" | "info";

interface AlertProps {
	status: AlertStatus;
	children: ReactNode;
	/** Optional custom icon. If omitted, a default icon for the status is used. */
	icon?: ReactNode;
	/** Optional title rendered in bold above the body text */
	title?: string;
	/** Additional CSS classes appended to the root element */
	className?: string;
	/** Optional dismiss handler — shows a close button when provided */
	onDismiss?: () => void;
}

// ---------------------------------------------------------------------------
// Style maps
// ---------------------------------------------------------------------------

const statusStyles: Record<AlertStatus, string> = {
	error:
		"bg-danger-soft border-danger-border text-on-danger [--alert-icon:var(--color-danger)]",
	success:
		"bg-success-soft border-success-border text-on-success [--alert-icon:var(--color-success)]",
	warning:
		"bg-warning-soft border-warning-border text-on-warning [--alert-icon:var(--color-warning)]",
	info: "bg-info-soft border-info-border text-on-info [--alert-icon:var(--color-info)]",
};

// ---------------------------------------------------------------------------
// Default status icons
// ---------------------------------------------------------------------------

function ErrorIcon() {
	return (
		<svg
			className="h-4 w-4 shrink-0"
			style={{ color: "var(--alert-icon)" }}
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			strokeWidth={2}
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
			/>
		</svg>
	);
}

function SuccessIcon() {
	return (
		<svg
			className="h-4 w-4 shrink-0"
			style={{ color: "var(--alert-icon)" }}
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			strokeWidth={2}
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
	);
}

function WarningIcon() {
	return (
		<svg
			className="h-4 w-4 shrink-0"
			style={{ color: "var(--alert-icon)" }}
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			strokeWidth={2}
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
			/>
		</svg>
	);
}

function InfoIcon() {
	return (
		<svg
			className="h-4 w-4 shrink-0"
			style={{ color: "var(--alert-icon)" }}
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			strokeWidth={2}
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
			/>
		</svg>
	);
}

function CloseIcon() {
	return (
		<svg
			className="h-4 w-4"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			strokeWidth={2}
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M6 18L18 6M6 6l12 12"
			/>
		</svg>
	);
}

const defaultIcons: Record<AlertStatus, () => ReactNode> = {
	error: ErrorIcon,
	success: SuccessIcon,
	warning: WarningIcon,
	info: InfoIcon,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Alert({
	status,
	children,
	icon,
	title,
	className = "",
	onDismiss,
}: AlertProps) {
	const StatusIcon = defaultIcons[status];

	return (
		<div
			role="alert"
			className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${statusStyles[status]} ${className}`.trim()}
		>
			{/* Icon */}
			<span className="mt-0.5">{icon ?? <StatusIcon />}</span>

			{/* Body */}
			<div className="min-w-0 flex-1">
				{title && <p className="text-sm font-semibold leading-snug">{title}</p>}
				<div className={`text-sm ${title ? "mt-0.5" : ""}`}>{children}</div>
			</div>

			{/* Dismiss button */}
			{onDismiss && (
				<button
					type="button"
					onClick={onDismiss}
					className="ml-auto -mr-1 -mt-0.5 shrink-0 rounded-md p-1 opacity-60 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
					aria-label="Dismiss"
				>
					<CloseIcon />
				</button>
			)}
		</div>
	);
}
