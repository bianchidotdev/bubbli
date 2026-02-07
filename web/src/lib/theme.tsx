import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Theme = "light" | "dark";
export type ThemePreference = Theme | "system";

interface ThemeContextValue {
	/** The resolved theme currently applied (always "light" or "dark") */
	theme: Theme;
	/** The user's preference, which may be "system" */
	preference: ThemePreference;
	/** Update the theme preference */
	setPreference: (preference: ThemePreference) => void;
	/** Convenience toggle between light and dark (resets "system" to explicit) */
	toggle: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "bubbli-theme-preference";
const DATA_ATTR = "data-theme";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSystemTheme(): Theme {
	if (typeof window === "undefined") return "light";
	return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
}

function getStoredPreference(): ThemePreference {
	if (typeof window === "undefined") return "system";
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === "light" || stored === "dark" || stored === "system") {
			return stored;
		}
	} catch {
		// localStorage may be unavailable (e.g. private browsing in some browsers)
	}
	return "system";
}

function storePreference(preference: ThemePreference): void {
	try {
		localStorage.setItem(STORAGE_KEY, preference);
	} catch {
		// Silently fail if storage is unavailable
	}
}

function resolveTheme(preference: ThemePreference): Theme {
	return preference === "system" ? getSystemTheme() : preference;
}

function applyTheme(theme: Theme): void {
	document.documentElement.setAttribute(DATA_ATTR, theme);
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [preference, setPreferenceState] =
		useState<ThemePreference>(getStoredPreference);
	const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme);

	const theme = preference === "system" ? systemTheme : preference;

	// Apply the data-theme attribute whenever the resolved theme changes
	useEffect(() => {
		applyTheme(theme);
	}, [theme]);

	// Listen for OS-level color scheme changes
	useEffect(() => {
		const mq = window.matchMedia(MEDIA_QUERY);

		function handleChange(e: MediaQueryListEvent) {
			setSystemTheme(e.matches ? "dark" : "light");
		}

		mq.addEventListener("change", handleChange);
		return () => mq.removeEventListener("change", handleChange);
	}, []);

	// Listen for storage changes from other tabs
	useEffect(() => {
		function handleStorage(e: StorageEvent) {
			if (e.key === STORAGE_KEY && e.newValue) {
				const value = e.newValue;
				if (value === "light" || value === "dark" || value === "system") {
					setPreferenceState(value);
				}
			}
		}

		window.addEventListener("storage", handleStorage);
		return () => window.removeEventListener("storage", handleStorage);
	}, []);

	const setPreference = useCallback((next: ThemePreference) => {
		setPreferenceState(next);
		storePreference(next);
	}, []);

	const toggle = useCallback(() => {
		setPreferenceState((prev) => {
			const resolved = resolveTheme(prev);
			const next: Theme = resolved === "light" ? "dark" : "light";
			storePreference(next);
			return next;
		});
	}, []);

	const value = useMemo<ThemeContextValue>(
		() => ({ theme, preference, setPreference, toggle }),
		[theme, preference, setPreference, toggle],
	);

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTheme(): ThemeContextValue {
	const ctx = useContext(ThemeContext);
	if (!ctx) {
		throw new Error("useTheme must be used within a <ThemeProvider>");
	}
	return ctx;
}
