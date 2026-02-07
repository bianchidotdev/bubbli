import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	Outlet,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

interface RouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
});

function RootComponent() {
	return (
		<div className="min-h-screen bg-gray-50 text-gray-900">
			<header className="border-b border-gray-200 bg-white">
				<nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
					<span className="text-xl font-bold tracking-tight">bubbli</span>
					<div className="flex gap-4 text-sm text-gray-500">
						<span>feed</span>
						<span>circles</span>
						<span>groups</span>
					</div>
				</nav>
			</header>

			<main className="mx-auto max-w-4xl px-4 py-6">
				<Outlet />
			</main>

			<ReactQueryDevtools buttonPosition="bottom-left" />
			<TanStackRouterDevtools position="bottom-right" />
		</div>
	);
}
