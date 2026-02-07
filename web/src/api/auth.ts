import { getToken } from "../lib/auth";

const API_BASE = "/api/auth";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface User {
	id: string;
	email: string;
	display_name: string | null;
	handle: string | null;
	bio: string | null;
	avatar_url: string | null;
	profile_visibility: "connections_only" | "public";
	comment_visibility: "connections_and_group_members" | "everyone_on_post";
	inserted_at: string;
	updated_at: string;
}

interface RequestMagicLinkResponse {
	ok: boolean;
	message: string;
}

interface CallbackResponse {
	user: User;
	token: string;
}

interface MeResponse {
	user: User;
}

interface SignOutResponse {
	ok: boolean;
}

interface ErrorResponse {
	error: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

class AuthApiError extends Error {
	status: number;

	constructor(status: number, message: string) {
		super(message);
		this.name = "AuthApiError";
		this.status = status;
	}
}

async function authFetch<T>(
	path: string,
	options: RequestInit = {},
): Promise<T> {
	const token = getToken();
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...(options.headers as Record<string, string>),
	};

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const res = await fetch(`${API_BASE}${path}`, {
		...options,
		headers,
	});

	const body = await res.json();

	if (!res.ok) {
		throw new AuthApiError(
			res.status,
			(body as ErrorResponse).error || "Unknown error",
		);
	}

	return body as T;
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

/**
 * Request a magic link email.
 * Always resolves successfully (even if the email doesn't exist) to prevent enumeration.
 */
export async function requestMagicLink(
	email: string,
): Promise<RequestMagicLinkResponse> {
	return authFetch<RequestMagicLinkResponse>("/magic-link/request", {
		method: "POST",
		body: JSON.stringify({ email }),
	});
}

/**
 * Exchange a magic link token for a session JWT.
 */
export async function magicLinkCallback(
	token: string,
): Promise<CallbackResponse> {
	return authFetch<CallbackResponse>("/magic-link/callback", {
		method: "POST",
		body: JSON.stringify({ token }),
	});
}

/**
 * Fetch the currently authenticated user.
 * Throws `AuthApiError` with status 401 if not authenticated.
 */
export async function fetchMe(): Promise<User> {
	const data = await authFetch<MeResponse>("/me");
	return data.user;
}

/**
 * Sign out the current user by revoking the token server-side.
 */
export async function signOut(): Promise<SignOutResponse> {
	return authFetch<SignOutResponse>("/sign-out", {
		method: "POST",
	});
}

export { AuthApiError };
