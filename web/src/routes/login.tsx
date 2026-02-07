import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		// TODO: call API to request magic link
		setSubmitted(true);
	}

	if (submitted) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="w-full max-w-sm space-y-6 text-center">
					<h1 className="text-2xl font-bold">Check your email</h1>
					<p className="text-gray-600">
						We sent a magic link to{" "}
						<span className="font-medium text-gray-900">{email}</span>
					</p>
					<p className="text-sm text-gray-500">
						Click the link in the email to sign in. It may take a minute to
						arrive.
					</p>
					<button
						type="button"
						onClick={() => setSubmitted(false)}
						className="text-sm text-blue-600 hover:text-blue-800"
					>
						Try a different email
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="w-full max-w-sm space-y-6">
				<div className="text-center">
					<h1 className="text-3xl font-bold">Bubbli</h1>
					<p className="mt-2 text-gray-600">Sign in with your email</p>
				</div>
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
							className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<button
						type="submit"
						className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
					>
						Send magic link
					</button>
				</form>
			</div>
		</div>
	);
}
