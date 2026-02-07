import type { ThemePreference } from "../../lib/theme";
import { useTheme } from "../../lib/theme";

const options: { value: ThemePreference; label: string; icon: string }[] = [
	{ value: "light", label: "Light", icon: "☀️" },
	{ value: "dark", label: "Dark", icon: "🌙" },
	{ value: "system", label: "System", icon: "💻" },
];

/**
 * A segmented toggle for switching between light, dark, and system themes.
 *
 * Renders as a compact pill-shaped control that fits naturally into navbars,
 * settings panels, or dropdown menus.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
	const { preference, setPreference } = useTheme();

	return (
		<fieldset
			className={`inline-flex items-center gap-0.5 rounded-full border border-border bg-surface-raised p-0.5 shadow-sm ${className}`}
			aria-label="Theme preference"
		>
			{options.map((option) => {
				const active = preference === option.value;
				return (
					<button
						key={option.value}
						type="button"
						aria-pressed={active}
						aria-label={option.label}
						title={option.label}
						onClick={() => setPreference(option.value)}
						className={`relative flex items-center justify-center rounded-full px-2.5 py-1.5 text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-1 ${
							active
								? "bg-primary text-on-primary shadow-sm"
								: "text-text-tertiary hover:bg-surface-sunken hover:text-text-secondary"
						}`}
					>
						<span className="mr-1" aria-hidden="true">
							{option.icon}
						</span>
						<span className="hidden sm:inline">{option.label}</span>
					</button>
				);
			})}
		</fieldset>
	);
}

/**
 * A minimal icon-only toggle that cycles: light → dark → system → light.
 *
 * Best for tight spaces like mobile headers.
 */
export function ThemeToggleCompact({ className = "" }: { className?: string }) {
	const { theme, preference, toggle, setPreference } = useTheme();

	function handleClick() {
		if (preference === "light") {
			setPreference("dark");
		} else if (preference === "dark") {
			setPreference("system");
		} else {
			toggle();
		}
	}

	const label =
		preference === "system"
			? `System (${theme})`
			: theme === "light"
				? "Light"
				: "Dark";

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-label={`Theme: ${label}. Click to change.`}
			title={`Theme: ${label}`}
			className={`relative flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-raised text-text-secondary shadow-sm transition-all hover:bg-surface-sunken hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-1 ${className}`}
		>
			{/* Sun icon (light mode) */}
			<svg
				className={`absolute h-4 w-4 transition-all duration-300 ${
					theme === "light"
						? "rotate-0 scale-100 opacity-100"
						: "rotate-90 scale-0 opacity-0"
				}`}
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth={2}
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
				/>
			</svg>

			{/* Moon icon (dark mode) */}
			<svg
				className={`absolute h-4 w-4 transition-all duration-300 ${
					theme === "dark"
						? "rotate-0 scale-100 opacity-100"
						: "-rotate-90 scale-0 opacity-0"
				}`}
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth={2}
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
				/>
			</svg>

			{/* System indicator dot */}
			{preference === "system" && (
				<span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
					<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
					<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
				</span>
			)}
		</button>
	);
}
