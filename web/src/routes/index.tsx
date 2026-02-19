import { createFileRoute, Link } from "@tanstack/react-router";
import { Button, Card } from "../components/ui";
import { useAuth } from "../lib/auth";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	const { isAuthenticated, user } = useAuth();

	if (!isAuthenticated) {
		return <UnauthenticatedHome />;
	}

	return (
		<AuthenticatedHome displayName={user?.profile?.display_name ?? null} />
	);
}

function AuthenticatedHome({ displayName }: { displayName: string | null }) {
	return (
		<div className="space-y-8">
			{/* Greeting */}
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-text">
					{displayName ? `Hey, ${displayName}` : "Welcome back"} 👋
				</h1>
				<p className="mt-1 text-sm text-text-tertiary">
					Here's what's happening in your circles.
				</p>
			</div>

			{/* Empty feed placeholder */}
			<Card variant="outlined" className="border-dashed">
				<Card.Body>
					<div className="flex flex-col items-center px-6 py-10 text-center">
						<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft">
							<svg
								className="h-7 w-7 text-primary"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={1.5}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
								/>
							</svg>
						</div>
						<h2 className="mt-4 text-lg font-semibold text-text">
							Your feed is empty
						</h2>
						<p className="mt-1 max-w-sm text-sm text-text-tertiary">
							Connect with friends and add them to your circles to start seeing
							their posts here.
						</p>

						<div className="mt-6 flex gap-3">
							<Link to="/profile">
								<Button
									variant="primary"
									iconLeft={
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
												d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
											/>
										</svg>
									}
								>
									Set up your profile
								</Button>
							</Link>
						</div>
					</div>
				</Card.Body>
			</Card>
		</div>
	);
}

function UnauthenticatedHome() {
	return (
		<div className="flex min-h-[70vh] items-center justify-center">
			<div className="w-full max-w-lg space-y-8 text-center">
				{/* Hero */}
				<div className="space-y-4">
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
						<span className="text-3xl font-bold text-on-primary">b</span>
					</div>
					<h1 className="text-4xl font-bold tracking-tight text-text">
						Your circles,
						<br />
						<span className="text-primary">your rules</span>
					</h1>
					<p className="mx-auto max-w-md text-base text-text-tertiary">
						Bubbli is a social space where you control who sees what. Share
						moments with close friends, family, or everyone — it's up to you.
					</p>
				</div>

				{/* CTA */}
				<div className="flex flex-col items-center gap-3">
					<Link to="/login">
						<Button
							size="lg"
							iconRight={
								<svg
									className="h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2.5}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
									/>
								</svg>
							}
						>
							Get started
						</Button>
					</Link>
					<p className="text-xs text-text-placeholder">
						No password needed — sign in with a magic link
					</p>
				</div>

				{/* Feature highlights */}
				<div className="grid grid-cols-3 gap-4 pt-4">
					<FeatureCard
						icon={
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
							/>
						}
						title="Circles"
						description="Organize friends into circles for precise sharing"
					/>
					<FeatureCard
						icon={
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
							/>
						}
						title="Privacy first"
						description="You decide who sees every post"
					/>
					<FeatureCard
						icon={
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
							/>
						}
						title="Real-time"
						description="Instant updates when friends post or comment"
					/>
				</div>
			</div>
		</div>
	);
}

function FeatureCard({
	icon,
	title,
	description,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
}) {
	return (
		<Card variant="outlined" className="p-4 text-center hover:shadow-md">
			<div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft">
				<svg
					className="h-5 w-5 text-primary"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={1.5}
				>
					{icon}
				</svg>
			</div>
			<h3 className="mt-2.5 text-sm font-semibold text-text">{title}</h3>
			<p className="mt-0.5 text-xs text-text-tertiary">{description}</p>
		</Card>
	);
}
