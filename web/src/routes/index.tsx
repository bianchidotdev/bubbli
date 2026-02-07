import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<div className="mx-auto max-w-2xl px-4 py-8">
			<h1 className="text-3xl font-bold tracking-tight">Your Feed</h1>
			<p className="mt-2 text-gray-500">
				Nothing here yet. Connect with friends to see their posts.
			</p>
		</div>
	);
}
