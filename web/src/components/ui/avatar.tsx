import { type ComponentProps, forwardRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps extends Omit<ComponentProps<"div">, "children"> {
	/** Display name used for the fallback initial */
	displayName?: string | null;
	/** Email used as secondary fallback for the initial */
	email?: string;
	/** URL to the avatar image */
	src?: string | null;
	/** Alt text for the image (falls back to displayName or email) */
	alt?: string;
	/** Size variant */
	size?: AvatarSize;
}

// ---------------------------------------------------------------------------
// Size mappings
// ---------------------------------------------------------------------------

const sizeClasses: Record<AvatarSize, string> = {
	xs: "h-6 w-6 text-xs",
	sm: "h-8 w-8 text-sm",
	md: "h-12 w-12 text-base",
	lg: "h-20 w-20 text-2xl",
	xl: "h-28 w-28 text-4xl",
};

const ringClasses: Record<AvatarSize, string> = {
	xs: "ring-1 ring-surface",
	sm: "ring-2 ring-surface",
	md: "ring-2 ring-surface",
	lg: "ring-4 ring-surface",
	xl: "ring-4 ring-surface",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
	{ displayName, email, src, alt, size = "md", className = "", ...rest },
	ref,
) {
	const initial =
		displayName?.[0]?.toUpperCase() ?? email?.[0]?.toUpperCase() ?? "?";
	const label = alt ?? displayName ?? email ?? "Avatar";
	const sizes = sizeClasses[size];
	const ring = ringClasses[size];

	if (src) {
		return (
			<div ref={ref} className={`${sizes} ${ring} ${className}`} {...rest}>
				<img
					src={src}
					alt={label}
					className="h-full w-full rounded-full object-cover shadow-sm"
				/>
			</div>
		);
	}

	return (
		<div
			ref={ref}
			role="img"
			aria-label={label}
			className={[
				sizes,
				ring,
				"flex items-center justify-center rounded-full",
				"bg-gradient-to-br from-primary to-accent",
				"font-bold text-on-primary shadow-sm",
				className,
			]
				.filter(Boolean)
				.join(" ")}
			{...rest}
		>
			{initial}
		</div>
	);
});
