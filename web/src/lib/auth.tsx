import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useMemo,
	useSyncExternalStore,
} from "react";

const TOKEN_KEY = "bubbli_token";

function getToken(): string | null {
	return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string): void {
	localStorage.setItem(TOKEN_KEY, token);
	notifyListeners();
}

function clearToken(): void {
	localStorage.removeItem(TOKEN_KEY);
	notifyListeners();
}

// Tiny external store so useSyncExternalStore can track token changes
// across tabs (via storage event) and within the same tab.
type Listener = () => void;
const listeners = new Set<Listener>();

function subscribe(listener: Listener): () => void {
	listeners.add(listener);

	const onStorage = (e: StorageEvent) => {
		if (e.key === TOKEN_KEY) {
			listener();
		}
	};
	window.addEventListener("storage", onStorage);

	return () => {
		listeners.delete(listener);
		window.removeEventListener("storage", onStorage);
	};
}

function notifyListeners() {
	for (const listener of listeners) {
		listener();
	}
}

function getSnapshot(): string | null {
	return getToken();
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AuthContextValue {
	/** Current bearer token, or null when signed out. */
	token: string | null;
	/** Whether the user has an active token. */
	isAuthenticated: boolean;
	/** Store a token received from the magic-link callback. */
	login: (token: string) => void;
	/** Clear the stored token. */
	logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
	const token = useSyncExternalStore(subscribe, getSnapshot, () => null);

	const login = useCallback((newToken: string) => {
		setToken(newToken);
	}, []);

	const logout = useCallback(() => {
		clearToken();
	}, []);

	const value = useMemo<AuthContextValue>(
		() => ({
			token,
			isAuthenticated: token !== null,
			login,
			logout,
		}),
		[token, login, logout],
	);

	return <AuthContext value={value}>{children}</AuthContext>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext);
	if (ctx === null) {
		throw new Error("useAuth must be used within an <AuthProvider>");
	}
	return ctx;
}

// ---------------------------------------------------------------------------
// Helpers for non-React code (e.g. the API client)
// ---------------------------------------------------------------------------

export { getToken, setToken, clearToken };
