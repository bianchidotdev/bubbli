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
		<div className="min-h-screen bg-gray-50 text-gray-900">
			<header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md">
				<nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
					<Link
						to="/"
						className="text-xl font-bold tracking-tight transition-colors hover:text-violet-600"
					>
						bubbli
					</Link>

					{isAuthenticated ? (
						<div className="flex items-center gap-1">
							<NavLink to="/" label="Feed" />
							<NavLink to="/profile" label="Profile" />

							{/* User menu */}
							<div className="relative ml-2">
								<button
									type="button"
									onClick={() => setMenuOpen((o) => !o)}
									className="flex items-center gap-2 rounded-full border border-gray-200 py-1.5 pr-3 pl-1.5 text-sm font-medium transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
								>
									<span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">
										{user?.display_name?.[0]?.toUpperCase() ??
											user?.email?.[0]?.toUpperCase() ??
											"?"}
									</span>
									<span className="max-w-[120px] truncate text-gray-700">
										{user?.display_name ?? user?.email ?? "Account"}
									</span>
									<svg
										className={`h-3.5 w-3.5 text-gray-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
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
										<div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
											<div className="border-b border-gray-100 px-4 py-2.5">
												<p className="truncate text-sm font-medium text-gray-900">
													{user?.display_name ?? "No name set"}
												</p>
												<p className="truncate text-xs text-gray-500">
													{user?.email}
												</p>
											</div>
											<Link
												to="/profile"
												onClick={() => setMenuOpen(false)}
												className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
											>
												<svg
													className="h-4 w-4 text-gray-400"
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
												className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
											>
												<svg
													className="h-4 w-4 text-red-400"
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
						<Link
							to="/login"
							className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-violet-700"
						>
							Sign in
						</Link>
					)}
				</nav>
			</header>

			<main className="mx-auto max-w-4xl px-4 py-6">
				{isLoading ? (
					<div className="flex items-center justify-center py-20">
						<div className="flex flex-col items-center gap-3">
							<div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
							<p className="text-sm text-gray-500">Loading...</p>
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
			className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 [&.active]:bg-violet-50 [&.active]:text-violet-700"
		>
			{label}
		</Link>
	);
}
