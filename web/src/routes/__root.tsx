import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	Link,
	Outlet,
	useRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useState } from "react";
import { Avatar, Button, Spinner, ThemeToggleCompact } from "../components/ui";
import { useAuth } from "../lib/auth";

interface RouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
});

function RootComponent() {
	const { isAuthenticated, isLoading, user, logout } = useAuth();
	const router = useRouter();
	const [menuOpen, setMenuOpen] = useState(false);

	async function handleLogout() {
		setMenuOpen(false);
		await logout();
		router.navigate({ to: "/login" });
	}

	return (
		<div className="min-h-screen bg-surface-sunken text-text">
			<header className="sticky top-0 z-30 border-b border-border bg-surface-overlay backdrop-blur-md">
				<nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
					<Link
						to="/"
						className="text-xl font-bold tracking-tight transition-colors hover:text-primary"
					>
						bubbli
					</Link>

					{isAuthenticated ? (
						<div className="flex items-center gap-1">
							<NavLink to="/" label="Feed" />
							<NavLink to="/profile" label="Profile" />

							<ThemeToggleCompact className="ml-1" />

							{/* User menu */}
							<div className="relative ml-2">
								<button
									type="button"
									onClick={() => setMenuOpen((o) => !o)}
									className="flex items-center gap-2 rounded-full border border-border py-1.5 pr-3 pl-1.5 text-sm font-medium transition-all hover:border-border-strong hover:bg-surface-sunken hover:shadow-sm"
								>
									<Avatar
										displayName={user?.display_name}
										email={user?.email}
										src={user?.avatar_url}
										size="xs"
									/>
									<span className="max-w-[120px] truncate text-text-secondary">
										{user?.display_name ?? user?.email ?? "Account"}
									</span>
									<svg
										className={`h-3.5 w-3.5 text-text-placeholder transition-transform ${menuOpen ? "rotate-180" : ""}`}
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={2.5}
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</button>

								{menuOpen && (
									<>
										{/* Backdrop to close menu */}
										<button
											type="button"
											tabIndex={-1}
											aria-label="Close menu"
											className="fixed inset-0 z-40 cursor-default appearance-none border-none bg-transparent"
											onClick={() => setMenuOpen(false)}
											onKeyDown={(e) => {
												if (e.key === "Escape") setMenuOpen(false);
											}}
										/>
										<div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-surface-raised py-1 shadow-lg">
											<div className="border-b border-border px-4 py-2.5">
												<p className="truncate text-sm font-medium text-text">
													{user?.display_name ?? "No name set"}
												</p>
												<p className="truncate text-xs text-text-tertiary">
													{user?.email}
												</p>
											</div>
											<Link
												to="/profile"
												onClick={() => setMenuOpen(false)}
												className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-surface-sunken"
											>
												<svg
													className="h-4 w-4 text-text-placeholder"
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
												Profile
											</Link>
											<button
												type="button"
												onClick={handleLogout}
												className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-danger transition-colors hover:bg-danger-soft"
											>
												<svg
													className="h-4 w-4 text-danger/70"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
													strokeWidth={2}
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
													/>
												</svg>
												Sign out
											</button>
										</div>
									</>
								)}
							</div>
						</div>
					) : (
						<div className="flex items-center gap-2">
							<ThemeToggleCompact />
							<Button
								variant="primary"
								size="sm"
								onClick={() => router.navigate({ to: "/login" })}
							>
								Sign in
							</Button>
						</div>
					)}
				</nav>
			</header>

			<main className="mx-auto max-w-4xl px-4 py-6">
				{isLoading ? (
					<div className="flex items-center justify-center py-20">
						<div className="flex flex-col items-center gap-3">
							<Spinner size="lg" />
							<p className="text-sm text-text-tertiary">Loading...</p>
						</div>
					</div>
				) : (
					<Outlet />
				)}
			</main>

			<ReactQueryDevtools buttonPosition="bottom-left" />
			<TanStackRouterDevtools position="bottom-right" />
		</div>
	);
}

function NavLink({ to, label }: { to: string; label: string }) {
	return (
		<Link
			to={to}
			className="rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-sunken hover:text-text [&.active]:bg-primary-soft [&.active]:text-on-primary-soft"
		>
			{label}
		</Link>
	);
}
