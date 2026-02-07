import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import api from "../api/client";
import {
	Alert,
	Avatar,
	Badge,
	Button,
	Card,
	FormField,
	Input,
	Select,
	Spinner,
	Textarea,
} from "../components/ui";
import { type User, useAuth } from "../lib/auth";

export const Route = createFileRoute("/profile")({
	component: ProfilePage,
});

function ProfilePage() {
	const { isAuthenticated, isLoading, user } = useAuth();
	const router = useRouter();

	if (isLoading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Spinner size="lg" />
			</div>
		);
	}

	if (!isAuthenticated || !user) {
		router.navigate({ to: "/login", replace: true });
		return null;
	}

	return <ProfileContent user={user} />;
}

function ProfileContent({ user }: { user: User }) {
	const [editing, setEditing] = useState(false);

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			{/* Page header */}
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold tracking-tight text-text">Profile</h1>
				{!editing && (
					<Button
						variant="secondary"
						size="md"
						onClick={() => setEditing(true)}
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
									d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
								/>
							</svg>
						}
					>
						Edit profile
					</Button>
				)}
			</div>

			{editing ? (
				<ProfileEditForm
					user={user}
					onCancel={() => setEditing(false)}
					onSaved={() => setEditing(false)}
				/>
			) : (
				<ProfileView user={user} />
			)}
		</div>
	);
}

// ---------------------------------------------------------------------------
// View mode
// ---------------------------------------------------------------------------

function ProfileView({ user }: { user: User }) {
	return (
		<Card variant="raised">
			{/* Banner area */}
			<div className="h-28 bg-gradient-to-r from-primary to-accent" />

			{/* Avatar + name section */}
			<Card.Body>
				<div className="-mt-16 flex items-end gap-4">
					<Avatar
						displayName={user.display_name}
						email={user.email}
						src={user.avatar_url}
						size="lg"
					/>
					<div className="min-w-0 pb-1">
						<h2 className="truncate text-xl font-bold text-text">
							{user.display_name || "No name set"}
						</h2>
						{user.handle && (
							<p className="truncate text-sm text-text-tertiary">
								@{user.handle}
							</p>
						)}
					</div>
				</div>

				{/* Bio */}
				{user.bio && (
					<p className="mt-4 text-sm leading-relaxed text-text-secondary">
						{user.bio}
					</p>
				)}

				{/* Details grid */}
				<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
					<DetailItem label="Email" value={user.email} />
					<DetailItem
						label="Handle"
						value={user.handle ? `@${user.handle}` : "Not set"}
						muted={!user.handle}
					/>
					<DetailItem
						label="Profile visibility"
						value={formatVisibility(user.profile_visibility)}
						badge={
							<Badge
								variant={
									user.profile_visibility === "public" ? "info" : "default"
								}
								size="sm"
							>
								{user.profile_visibility === "public" ? "Public" : "Private"}
							</Badge>
						}
					/>
					<DetailItem
						label="Comment visibility"
						value={formatCommentVisibility(user.comment_visibility)}
					/>
					<DetailItem
						label="Joined"
						value={new Date(user.inserted_at).toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					/>
				</div>
			</Card.Body>
		</Card>
	);
}

function DetailItem({
	label,
	value,
	muted = false,
	badge,
}: {
	label: string;
	value: string;
	muted?: boolean;
	badge?: React.ReactNode;
}) {
	return (
		<div className="rounded-lg border border-border bg-surface-sunken/50 px-4 py-3">
			<dt className="flex items-center justify-between gap-2">
				<span className="text-xs font-medium uppercase tracking-wider text-text-placeholder">
					{label}
				</span>
				{badge}
			</dt>
			<dd
				className={`mt-0.5 truncate text-sm font-medium ${muted ? "italic text-text-placeholder" : "text-text"}`}
			>
				{value}
			</dd>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Edit mode
// ---------------------------------------------------------------------------

interface ProfileFormState {
	display_name: string;
	handle: string;
	bio: string;
	avatar_url: string;
	profile_visibility: "connections_only" | "public";
	comment_visibility: "connections_and_group_members" | "everyone_on_post";
}

function ProfileEditForm({
	user,
	onCancel,
	onSaved,
}: {
	user: User;
	onCancel: () => void;
	onSaved: () => void;
}) {
	const { login, token } = useAuth();
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const [form, setForm] = useState<ProfileFormState>({
		display_name: user.display_name ?? "",
		handle: user.handle ?? "",
		bio: user.bio ?? "",
		avatar_url: user.avatar_url ?? "",
		profile_visibility: user.profile_visibility,
		comment_visibility: user.comment_visibility,
	});

	const updateField = useCallback(
		<K extends keyof ProfileFormState>(
			field: K,
			value: ProfileFormState[K],
		) => {
			setForm((prev) => ({ ...prev, [field]: value }));
			setError(null);
			setSuccess(false);
		},
		[],
	);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSaving(true);
		setError(null);
		setSuccess(false);

		try {
			const { error: apiError } = await api.PATCH("/api/users/{id}/profile", {
				params: { path: { id: user.id } },
				body: {
					data: {
						id: user.id,
						type: "user",
						attributes: {
							display_name: form.display_name || null,
							handle: form.handle || null,
							bio: form.bio || null,
							avatar_url: form.avatar_url || null,
							profile_visibility: form.profile_visibility,
							comment_visibility: form.comment_visibility,
						},
					},
				},
			});

			if (apiError) {
				const errorDetail =
					Array.isArray(apiError) && apiError.length > 0
						? ((apiError[0] as { detail?: string }).detail ??
							"Failed to update profile.")
						: "Failed to update profile.";
				setError(errorDetail);
				return;
			}

			// Re-trigger /me fetch to pick up updated user data
			if (token) {
				login(token);
			}

			setSuccess(true);
			setTimeout(() => {
				onSaved();
			}, 800);
		} catch {
			setError("An unexpected error occurred. Please try again.");
		} finally {
			setSaving(false);
		}
	}

	return (
		<Card variant="raised">
			{/* Banner */}
			<div className="h-28 bg-gradient-to-r from-primary to-accent" />

			<Card.Body>
				<div className="-mt-16 mb-6">
					<Avatar
						displayName={form.display_name}
						email={user.email}
						src={form.avatar_url}
						size="lg"
					/>
				</div>

				{/* Feedback messages */}
				{error && (
					<Alert
						status="error"
						className="mb-4"
						onDismiss={() => setError(null)}
					>
						{error}
					</Alert>
				)}

				{success && (
					<Alert status="success" className="mb-4">
						Profile updated successfully!
					</Alert>
				)}

				<form onSubmit={handleSubmit} className="space-y-5">
					{/* Display name */}
					<FormField label="Display name" htmlFor="display_name">
						<Input
							id="display_name"
							type="text"
							maxLength={100}
							value={form.display_name}
							onChange={(e) => updateField("display_name", e.target.value)}
							placeholder="Your display name"
						/>
					</FormField>

					{/* Handle */}
					<FormField
						label="Handle"
						htmlFor="handle"
						hint="Letters, numbers, and underscores only"
					>
						<Input
							id="handle"
							type="text"
							maxLength={40}
							pattern="[a-zA-Z0-9_]+"
							value={form.handle}
							onChange={(e) => updateField("handle", e.target.value)}
							placeholder="your_handle"
							leadingAddon={
								<span className="text-sm text-text-placeholder">@</span>
							}
						/>
					</FormField>

					{/* Bio */}
					<FormField label="Bio" htmlFor="bio" hint={`${form.bio.length}/500`}>
						<Textarea
							id="bio"
							maxLength={500}
							rows={3}
							value={form.bio}
							onChange={(e) => updateField("bio", e.target.value)}
							placeholder="Tell people a little about yourself..."
							className="resize-none"
						/>
					</FormField>

					{/* Avatar URL */}
					<FormField
						label="Avatar URL"
						htmlFor="avatar_url"
						hint="Paste a link to your profile picture"
					>
						<Input
							id="avatar_url"
							type="url"
							value={form.avatar_url}
							onChange={(e) => updateField("avatar_url", e.target.value)}
							placeholder="https://example.com/avatar.jpg"
						/>
					</FormField>

					{/* Privacy settings */}
					<div className="rounded-xl border border-border bg-surface-sunken/50 p-4">
						<h3 className="text-sm font-semibold text-text">Privacy</h3>

						<div className="mt-4 space-y-4">
							<FormField
								label="Who can see your profile?"
								htmlFor="profile_visibility"
							>
								<Select
									id="profile_visibility"
									value={form.profile_visibility}
									onChange={(e) =>
										updateField(
											"profile_visibility",
											e.target.value as ProfileFormState["profile_visibility"],
										)
									}
								>
									<option value="connections_only">Connections only</option>
									<option value="public">Public</option>
								</Select>
							</FormField>

							<FormField
								label="Who can comment on your posts?"
								htmlFor="comment_visibility"
							>
								<Select
									id="comment_visibility"
									value={form.comment_visibility}
									onChange={(e) =>
										updateField(
											"comment_visibility",
											e.target.value as ProfileFormState["comment_visibility"],
										)
									}
								>
									<option value="connections_and_group_members">
										Connections & group members
									</option>
									<option value="everyone_on_post">
										Everyone who can see the post
									</option>
								</Select>
							</FormField>
						</div>
					</div>

					{/* Actions */}
					<div className="flex items-center justify-end gap-3 border-t border-border pt-5">
						<Button variant="secondary" onClick={onCancel} disabled={saving}>
							Cancel
						</Button>
						<Button variant="primary" type="submit" loading={saving}>
							{saving ? "Saving..." : "Save changes"}
						</Button>
					</div>
				</form>
			</Card.Body>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatVisibility(v: string): string {
	switch (v) {
		case "connections_only":
			return "Connections only";
		case "public":
			return "Public";
		default:
			return v;
	}
}

function formatCommentVisibility(v: string): string {
	switch (v) {
		case "connections_and_group_members":
			return "Connections & group members";
		case "everyone_on_post":
			return "Everyone who can see the post";
		default:
			return v;
	}
}
