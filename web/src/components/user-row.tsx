import type { ReactNode } from "react";
import { Avatar } from "./ui";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserRowProps {
	/** User's display name */
	displayName?: string | null;
	/** User's @handle */
	handle?: string | null;
	/** User's email (fallback for avatar) */
	email?: string;
	/** Avatar image URL */
	avatarUrl?: string | null;
	/** Content rendered on the trailing (right) side — buttons, badges, etc. */
	trailing?: ReactNode;
	/** Optional secondary line below the name (replaces handle when provided) */
	subtitle?: ReactNode;
	/** Additional CSS classes on the root element */
	className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UserRow({
	displayName,
	handle,
	email,
	avatarUrl,
	trailing,
	subtitle,
	className = "",
}: UserRowProps) {
	const secondaryContent = subtitle ?? (handle ? `@${handle}` : null);

	return (
		<div className={`flex items-center gap-3 ${className}`}>
			<Avatar
				displayName={displayName}
				email={email}
				src={avatarUrl}
				size="md"
			/>

			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-semibold text-text">
					{displayName ?? "Unknown"}
				</p>
				{secondaryContent && (
					<p className="truncate text-xs text-text-tertiary">
						{secondaryContent}
					</p>
				)}
			</div>

			{trailing && (
				<div className="flex shrink-0 items-center gap-2">{trailing}</div>
			)}
		</div>
	);
}
