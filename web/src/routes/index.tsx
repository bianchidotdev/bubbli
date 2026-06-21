import { createFileRoute, Link } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import {
	type ResolvedPost,
	useCreatePost,
	useDeletePost,
	useFeed,
} from "../api/posts";
import {
	Alert,
	Avatar,
	Badge,
	Button,
	Card,
	EmptyState,
	Spinner,
	Textarea,
} from "../components/ui";
import { useAuth } from "../lib/auth";

export const Route = createFileRoute("/")({
	component: HomePage,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(dateString: string): string {
	const now = Date.now();
	const then = new Date(dateString).getTime();
	const seconds = Math.floor((now - then) / 1000);

	if (seconds < 60) return "just now";
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d ago`;
	const months = Math.floor(days / 30);
	if (months < 12) return `${months}mo ago`;
	return `${Math.floor(months / 12)}y ago`;
}

type AudienceType = "private" | "connections" | "public";

const AUDIENCE_OPTIONS: { type: AudienceType; label: string; icon: string }[] =
	[
		{ type: "private", label: "Private", icon: "lock" },
		{ type: "connections", label: "Connections", icon: "people" },
		{ type: "public", label: "Public", icon: "globe" },
	];

function AudienceIcon({ icon }: { icon: string }) {
	switch (icon) {
		case "lock":
			return (
				<svg
					className="h-3.5 w-3.5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
					/>
				</svg>
			);
		case "people":
			return (
				<svg
					className="h-3.5 w-3.5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
					/>
				</svg>
			);
		case "globe":
			return (
				<svg
					className="h-3.5 w-3.5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
					/>
				</svg>
			);
		default:
			return null;
	}
}

function audienceBadgeVariant(
	type: string,
): "default" | "primary" | "info" | "warning" {
	switch (type) {
		case "public":
			return "info";
		case "connections":
			return "primary";
		case "private":
			return "warning";
		default:
			return "default";
	}
}

function audienceLabel(type: string): string {
	switch (type) {
		case "public":
			return "Public";
		case "connections":
			return "Connections";
		case "private":
			return "Private";
		case "circle":
			return "Circle";
		case "group":
			return "Group";
		default:
			return type;
	}
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function HomePage() {
	const { isAuthenticated, user } = useAuth();

	if (!isAuthenticated) {
		return <UnauthenticatedHome />;
	}

	return <AuthenticatedHome user={user} />;
}

// ---------------------------------------------------------------------------
// Authenticated home
// ---------------------------------------------------------------------------

function AuthenticatedHome({
	user,
}: {
	user: {
		id: string;
		email: string;
		profile: { display_name: string | null; avatar_url: string | null } | null;
	} | null;
}) {
	const displayName = user?.profile?.display_name ?? null;

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			{/* Greeting */}
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-text">
					{displayName ? `Hey, ${displayName}` : "Welcome back"} 👋
				</h1>
				<p className="mt-1 text-sm text-text-tertiary">
					Here's what's happening in your circles.
				</p>
			</div>

			{/* Composer */}
			<PostComposer user={user} />

			{/* Feed */}
			<Feed currentUserId={user?.id ?? null} />
		</div>
	);
}

// ---------------------------------------------------------------------------
// Post composer
// ---------------------------------------------------------------------------

function PostComposer({
	user,
}: {
	user: {
		profile: { display_name: string | null; avatar_url: string | null } | null;
		email: string;
	} | null;
}) {
	const [body, setBody] = useState("");
	const [selectedAudiences, setSelectedAudiences] = useState<Set<AudienceType>>(
		new Set(["connections"]),
	);
	const createPost = useCreatePost();

	function toggleAudience(type: AudienceType) {
		setSelectedAudiences((prev) => {
			const next = new Set(prev);
			if (next.has(type)) {
				// Don't allow deselecting the last one
				if (next.size > 1) next.delete(type);
			} else {
				next.add(type);
			}
			return next;
		});
	}

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		const trimmed = body.trim();
		if (!trimmed || createPost.isPending) return;

		createPost.mutate(
			{
				body: trimmed,
				audiences: Array.from(selectedAudiences).map((type) => ({ type })),
			},
			{
				onSuccess: () => {
					setBody("");
					setSelectedAudiences(new Set(["connections"]));
				},
			},
		);
	}

	return (
		<Card variant="raised">
			<Card.Body>
				<form onSubmit={handleSubmit}>
					<div className="flex gap-3">
						<Avatar
							size="sm"
							src={user?.profile?.avatar_url}
							displayName={user?.profile?.display_name}
							email={user?.email}
							className="mt-1 shrink-0"
						/>
						<div className="min-w-0 flex-1">
							<Textarea
								variant="ghost"
								placeholder="What's on your mind?"
								value={body}
								onChange={(e) => setBody(e.target.value)}
								rows={3}
								className="min-h-16 resize-none"
							/>
						</div>
					</div>

					{/* Audience picker + submit */}
					<div className="mt-3 flex items-center justify-between gap-3">
						<div className="flex flex-wrap gap-1.5">
							{AUDIENCE_OPTIONS.map((opt) => {
								const selected = selectedAudiences.has(opt.type);
								return (
									<button
										key={opt.type}
										type="button"
										onClick={() => toggleAudience(opt.type)}
										className={[
											"inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
											selected
												? "bg-primary-soft text-on-primary-soft ring-1 ring-primary/30"
												: "bg-surface-sunken text-text-tertiary hover:bg-surface-sunken/80 hover:text-text-secondary",
										].join(" ")}
									>
										<AudienceIcon icon={opt.icon} />
										{opt.label}
									</button>
								);
							})}
						</div>

						<Button
							type="submit"
							variant="primary"
							size="sm"
							loading={createPost.isPending}
							disabled={!body.trim() || createPost.isPending}
						>
							Post
						</Button>
					</div>

					{createPost.isError && (
						<div className="mt-3">
							<Alert status="error">{createPost.error.message}</Alert>
						</div>
					)}
				</form>
			</Card.Body>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Feed
// ---------------------------------------------------------------------------

function Feed({ currentUserId }: { currentUserId: string | null }) {
	const { data: posts, isLoading, error } = useFeed();
	const deletePost = useDeletePost();

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Spinner size="lg" />
			</div>
		);
	}

	if (error) {
		return <Alert status="error">{error.message}</Alert>;
	}

	if (!posts || posts.length === 0) {
		return (
			<Card variant="outlined" className="border-dashed">
				<Card.Body>
					<EmptyState
						size="lg"
						icon={
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
							/>
						}
						title="Your feed is empty"
						description="Connect with friends and add them to your circles to start seeing their posts here."
						action={
							<Link to="/profile">
								<Button variant="primary" size="sm">
									Set up your profile
								</Button>
							</Link>
						}
					/>
				</Card.Body>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{posts.map((post) => (
				<PostCard
					key={post.id}
					post={post}
					isOwn={post.author?.id === currentUserId}
					onDelete={() => deletePost.mutate(post.id)}
					isDeleting={deletePost.isPending && deletePost.variables === post.id}
				/>
			))}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Post card
// ---------------------------------------------------------------------------

function PostCard({
	post,
	isOwn,
	onDelete,
	isDeleting,
}: {
	post: ResolvedPost;
	isOwn: boolean;
	onDelete: () => void;
	isDeleting: boolean;
}) {
	const authorName =
		post.author?.resolvedProfile?.attributes?.display_name ??
		post.author?.attributes?.email ??
		"Unknown";
	const authorAvatar =
		post.author?.resolvedProfile?.attributes?.avatar_url ?? null;
	const authorEmail = post.author?.attributes?.email;

	return (
		<Card variant="raised">
			<Card.Body>
				{/* Author row */}
				<div className="flex items-start justify-between gap-3">
					<div className="flex items-center gap-3">
						<Avatar
							size="sm"
							src={authorAvatar}
							displayName={authorName}
							email={authorEmail}
						/>
						<div className="min-w-0">
							<p className="truncate text-sm font-semibold text-text">
								{authorName}
							</p>
							<p className="text-xs text-text-tertiary">
								{timeAgo(post.insertedAt)}
							</p>
						</div>
					</div>

					{isOwn && (
						<Button
							variant="ghost"
							size="sm"
							onClick={onDelete}
							loading={isDeleting}
							disabled={isDeleting}
							className="text-text-tertiary hover:text-danger"
							aria-label="Delete post"
						>
							<svg
								className="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={1.5}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
								/>
							</svg>
						</Button>
					)}
				</div>

				{/* Body */}
				<p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-text">
					{post.body}
				</p>

				{/* Audience badges */}
				{post.audiences.length > 0 && (
					<div className="mt-3 flex flex-wrap gap-1.5">
						{post.audiences.map((audience) => (
							<Badge
								key={audience.id}
								variant={audienceBadgeVariant(
									audience.attributes?.type ?? "public",
								)}
								size="sm"
							>
								{audienceLabel(audience.attributes?.type ?? "public")}
							</Badge>
						))}
					</div>
				)}
			</Card.Body>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Unauthenticated home (unchanged)
// ---------------------------------------------------------------------------

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
