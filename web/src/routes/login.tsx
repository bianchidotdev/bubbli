import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { requestMagicLink } from "../api/auth";
import { Alert, Button, FormField, Input } from "../components/ui";
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
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft">
						<svg
							className="h-8 w-8 text-primary"
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
						<h1 className="text-2xl font-bold text-text">Check your email</h1>
						<p className="mt-2 text-text-secondary">
							We sent a magic link to{" "}
							<span className="font-medium text-text">{email}</span>
						</p>
					</div>

					<p className="text-sm text-text-tertiary">
						Click the link in the email to sign in. It may take a minute to
						arrive.
					</p>

					<div className="pt-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setSubmitted(false);
								setEmail("");
							}}
						>
							← Try a different email
						</Button>
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
					<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
						<span className="text-2xl font-bold text-on-primary">b</span>
					</div>
					<h1 className="text-2xl font-bold tracking-tight text-text">
						Welcome to Bubbli
					</h1>
					<p className="mt-1 text-sm text-text-tertiary">
						Sign in with a magic link — no password needed
					</p>
				</div>

				{/* Error message */}
				{error && (
					<Alert status="error" onDismiss={() => setError(null)}>
						{error}
					</Alert>
				)}

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-4">
					<FormField label="Email address" htmlFor="email">
						<Input
							id="email"
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@example.com"
							disabled={loading}
							autoComplete="email"
							autoFocus
						/>
					</FormField>

					<Button
						variant="primary"
						size="md"
						loading={loading}
						disabled={!email}
						className="w-full"
						onClick={(e) => {
							// Let the form handle submission
							const form = (e.target as HTMLElement).closest("form");
							if (form) {
								form.requestSubmit();
							}
						}}
					>
						{loading ? "Sending..." : "Send magic link"}
					</Button>
				</form>

				<p className="text-center text-xs text-text-placeholder">
					We'll send a one-time sign-in link to your email.
					<br />
					No account? One will be created automatically.
				</p>
			</div>
		</div>
	);
}
