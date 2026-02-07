import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { requestMagicLink } from "../api/auth";
import { useAuth } from "../lib/auth";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	const { isAuthenticated } = useAuth();
	const router = useRouter();

	// If already authenticated, redirect to home
	if (isAuthenticated) {
		router.navigate({ to: "/" });
		return null;
	}

	return <LoginForm />;
}

function LoginForm() {
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			await requestMagicLink(email);
			setSubmitted(true);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Something went wrong. Please try again.",
			);
		} finally {
			setLoading(false);
		}
	}

	if (submitted) {
		return (
			<div className="flex min-h-[70vh] items-center justify-center">
				<div className="w-full max-w-sm space-y-6 text-center">
					{/* Envelope icon */}
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
						<svg
							className="h-8 w-8 text-violet-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1.5}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
							/>
						</svg>
					</div>

					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							Check your email
						</h1>
						<p className="mt-2 text-gray-600">
							We sent a magic link to{" "}
							<span className="font-medium text-gray-900">{email}</span>
						</p>
					</div>

					<p className="text-sm text-gray-500">
						Click the link in the email to sign in. It may take a minute to
						arrive.
					</p>

					<div className="pt-2">
						<button
							type="button"
							onClick={() => {
								setSubmitted(false);
								setEmail("");
							}}
							className="text-sm font-medium text-violet-600 transition-colors hover:text-violet-800"
						>
							← Try a different email
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-[70vh] items-center justify-center">
			<div className="w-full max-w-sm space-y-8">
				{/* Logo & heading */}
				<div className="text-center">
					<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-200">
						<span className="text-2xl font-bold text-white">b</span>
					</div>
					<h1 className="text-2xl font-bold tracking-tight text-gray-900">
						Welcome to Bubbli
					</h1>
					<p className="mt-1 text-sm text-gray-500">
						Sign in with a magic link — no password needed
					</p>
				</div>

				{/* Error message */}
				{error && (
					<div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
						<svg
							className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
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
						<p className="text-sm text-red-700">{error}</p>
					</div>
				)}

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700"
						>
							Email address
						</label>
						<input
							id="email"
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@example.com"
							disabled={loading}
							autoComplete="email"
							autoFocus
							className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-sm transition-all placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
						/>
					</div>
					<button
						type="submit"
						disabled={loading || !email}
						className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
					>
						{loading ? (
							<>
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
								Sending...
							</>
						) : (
							"Send magic link"
						)}
					</button>
				</form>

				<p className="text-center text-xs text-gray-400">
					We'll send a one-time sign-in link to your email.
					<br />
					No account? One will be created automatically.
				</p>
			</div>
		</div>
	);
}
