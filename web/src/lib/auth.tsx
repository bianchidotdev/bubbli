import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useSyncExternalStore,
} from "react";
import { signOut as apiSignOut, fetchMe, type User } from "../api/auth";

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
// Query key & hook for /me
// ---------------------------------------------------------------------------

export const meQueryKey = ["auth", "me"] as const;

/**
 * Fetches the current user from `/api/auth/me`.
 * Only enabled when a token exists in localStorage.
 */
export function useMe() {
	const token = useSyncExternalStore(subscribe, getSnapshot, () => null);

	return useQuery<User | null>({
		queryKey: meQueryKey,
		queryFn: async () => {
			try {
				return await fetchMe();
			} catch {
				// Token is invalid or expired — clear it
				clearToken();
				return null;
			}
		},
		enabled: token !== null,
		staleTime: 1000 * 60 * 5, // 5 minutes
		retry: false,
	});
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AuthContextValue {
	/** Current bearer token, or null when signed out. */
	token: string | null;
	/** The authenticated user, or null when signed out / loading. */
	user: User | null;
	/** Whether the user has an active token. */
	isAuthenticated: boolean;
	/** Whether the /me query is currently loading. */
	isLoading: boolean;
	/** Store a token received from the magic-link callback. */
	login: (token: string) => void;
	/** Revoke the token server-side and clear local state. */
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
	const token = useSyncExternalStore(subscribe, getSnapshot, () => null);
	const queryClient = useQueryClient();

	const { data: user = null, isLoading: meLoading } = useMe();

	const login = useCallback(
		(newToken: string) => {
			setToken(newToken);
			// Invalidate the /me query so it refetches with the new token
			queryClient.invalidateQueries({ queryKey: meQueryKey });
		},
		[queryClient],
	);

	const logout = useCallback(async () => {
		try {
			await apiSignOut();
		} catch {
			// Sign-out failed server-side, still clear locally
		}
		clearToken();
		queryClient.setQueryData(meQueryKey, null);
		queryClient.invalidateQueries();
	}, [queryClient]);

	const isLoading = token !== null && meLoading;

	const value = useMemo<AuthContextValue>(
		() => ({
			token,
			user,
			isAuthenticated: token !== null && user !== null,
			isLoading,
			login,
			logout,
		}),
		[token, user, isLoading, login, logout],
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
export type { User };
