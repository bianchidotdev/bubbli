import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { magicLinkCallback } from "../api/auth";
import { useAuth } from "../lib/auth";

type CallbackSearch = {
	token?: string;
};

export const Route = createFileRoute("/auth/magic-link/callback")({
	validateSearch: (search: Record<string, unknown>): CallbackSearch => ({
		token: typeof search.token === "string" ? search.token : undefined,
	}),
	component: MagicLinkCallbackPage,
});

function MagicLinkCallbackPage() {
	const { token } = Route.useSearch();
	const { login } = useAuth();
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const attempted = useRef(false);

	useEffect(() => {
		// Prevent double-fire in StrictMode
		if (attempted.current) return;
		attempted.current = true;

		if (!token) {
			setError("No token found in the URL. Please request a new magic link.");
			return;
		}

		const validToken = token;

		async function exchangeToken() {
			try {
				const result = await magicLinkCallback(validToken);
				login(result.token);
				router.navigate({ to: "/", replace: true });
			} catch (err) {
				if (err instanceof Error) {
					setError(err.message);
				} else {
					setError("Failed to sign in. The link may have expired.");
				}
			}
		}

		exchangeToken();
	}, [token, login, router]);

	if (error) {
		return (
			<div className="flex min-h-[70vh] items-center justify-center">
				<div className="w-full max-w-sm space-y-6 text-center">
					{/* Error icon */}
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
						<svg
							className="h-8 w-8 text-red-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1.5}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
							/>
						</svg>
					</div>

					<div>
						<h1 className="text-xl font-bold text-gray-900">Sign-in failed</h1>
						<p className="mt-2 text-sm text-gray-600">{error}</p>
					</div>

					<button
						type="button"
						onClick={() => router.navigate({ to: "/login", replace: true })}
						className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:outline-none"
					>
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
								d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
							/>
						</svg>
						Back to sign in
					</button>
				</div>
			</div>
		);
	}

	// Loading / exchanging token
	return (
		<div className="flex min-h-[70vh] items-center justify-center">
			<div className="flex flex-col items-center gap-4">
				<div className="h-10 w-10 animate-spin rounded-full border-[3px] border-violet-200 border-t-violet-600" />
				<p className="text-sm font-medium text-gray-500">Signing you in...</p>
			</div>
		</div>
	);
}
