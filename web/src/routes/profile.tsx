import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Profile } from "../api/auth";
import { type ProfileUpdateFields, useUpdateProfile } from "../api/profile";
import {
	Alert,
	Avatar,
	Badge,
	Card,
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

// ---------------------------------------------------------------------------
// Main profile content
// ---------------------------------------------------------------------------

function ProfileContent({ user }: { user: User }) {
	const profile = user.profile;

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			{/* Profile card */}
			<Card variant="raised">
				{/* Banner */}
				<div className="relative h-32 bg-gradient-to-r from-primary to-accent sm:h-36" />

				<Card.Body>
					{/* Avatar + identity */}
					<div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end">
						<Avatar
							displayName={profile?.display_name}
							email={user.email}
							src={profile?.avatar_url}
							size="xl"
						/>
						<div className="min-w-0 flex-1 pb-1">
							{profile ? (
								<InlineTextField
									profileId={profile.id}
									field="display_name"
									value={profile.display_name}
									placeholder="Add your name"
									className="text-xl font-bold text-text"
									inputClassName="text-xl font-bold"
									maxLength={100}
								/>
							) : (
								<p className="text-xl font-bold text-text-placeholder italic">
									No name set
								</p>
							)}
							{profile && (
								<InlineTextField
									profileId={profile.id}
									field="handle"
									value={profile.handle}
									placeholder="Add a handle"
									prefix="@"
									className="text-sm text-text-tertiary"
									inputClassName="text-sm"
									maxLength={40}
									pattern="[a-zA-Z0-9_]+"
								/>
							)}
						</div>
					</div>

					{/* Email (non-editable) */}
					<div className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
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
								d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
							/>
						</svg>
						<span>{user.email}</span>
					</div>

					{/* Joined date */}
					<div className="mt-1 flex items-center gap-2 text-sm text-text-tertiary">
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
								d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
							/>
						</svg>
						<span>
							Joined{" "}
							{new Date(user.inserted_at).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</span>
					</div>
				</Card.Body>
			</Card>

			{/* About section */}
			{profile && <AboutSection profile={profile} />}

			{/* Privacy settings */}
			{profile && <PrivacySection profile={profile} />}

			{/* Posts placeholder */}
			<PostsPlaceholder />
		</div>
	);
}

// ---------------------------------------------------------------------------
// About section
// ---------------------------------------------------------------------------

function AboutSection({ profile }: { profile: Profile }) {
	return (
		<Card variant="raised">
			<Card.Header heading="About" />
			<Card.Body>
				<div className="space-y-4">
					{/* Location */}
					<div className="flex items-start gap-3">
						<svg
							className="mt-0.5 h-5 w-5 shrink-0 text-text-placeholder"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1.5}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
							/>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
							/>
						</svg>
						<div className="min-w-0 flex-1">
							<InlineTextField
								profileId={profile.id}
								field="location"
								value={profile.location}
								placeholder="Add your location"
								className="text-sm text-text-secondary"
								inputClassName="text-sm"
								maxLength={100}
							/>
						</div>
					</div>

					{/* Bio */}
					<div className="flex items-start gap-3">
						<svg
							className="mt-0.5 h-5 w-5 shrink-0 text-text-placeholder"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1.5}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
							/>
						</svg>
						<div className="min-w-0 flex-1">
							<InlineBioField profileId={profile.id} value={profile.bio} />
						</div>
					</div>

					{/* Avatar URL */}
					<div className="flex items-start gap-3">
						<svg
							className="mt-0.5 h-5 w-5 shrink-0 text-text-placeholder"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1.5}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
							/>
						</svg>
						<div className="min-w-0 flex-1">
							<InlineTextField
								profileId={profile.id}
								field="avatar_url"
								value={profile.avatar_url}
								placeholder="Paste avatar image URL"
								className="text-sm text-text-secondary"
								inputClassName="text-sm"
							/>
						</div>
					</div>
				</div>
			</Card.Body>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Privacy section
// ---------------------------------------------------------------------------

function PrivacySection({ profile }: { profile: Profile }) {
	const updateProfile = useUpdateProfile();

	function handleVisibilityChange(value: string) {
		updateProfile.mutate({
			profileId: profile.id,
			fields: {
				profile_visibility: value as "connections_only" | "public",
			},
		});
	}

	function handleCommentVisibilityChange(value: string) {
		updateProfile.mutate({
			profileId: profile.id,
			fields: {
				comment_visibility: value as
					| "connections_and_group_members"
					| "everyone_on_post",
			},
		});
	}

	return (
		<Card variant="raised">
			<Card.Header
				heading="Privacy"
				description="Control who can see your profile and interact with your posts"
			/>
			<Card.Body>
				{updateProfile.isError && (
					<Alert status="error" className="mb-4">
						Failed to update privacy settings. Please try again.
					</Alert>
				)}

				<div className="space-y-5">
					<div>
						<label
							htmlFor="profile_visibility"
							className="mb-1.5 block text-sm font-medium text-text"
						>
							Who can see your profile?
						</label>
						<div className="flex items-center gap-3">
							<Select
								id="profile_visibility"
								selectSize="sm"
								value={profile.profile_visibility}
								onChange={(e) => handleVisibilityChange(e.target.value)}
							>
								<option value="connections_only">Connections only</option>
								<option value="public">Public</option>
							</Select>
							<Badge
								variant={
									profile.profile_visibility === "public" ? "info" : "default"
								}
								size="sm"
							>
								{profile.profile_visibility === "public" ? "Public" : "Private"}
							</Badge>
						</div>
					</div>

					<div>
						<label
							htmlFor="comment_visibility"
							className="mb-1.5 block text-sm font-medium text-text"
						>
							Who can comment on your posts?
						</label>
						<Select
							id="comment_visibility"
							selectSize="sm"
							value={profile.comment_visibility}
							onChange={(e) => handleCommentVisibilityChange(e.target.value)}
						>
							<option value="connections_and_group_members">
								Connections & group members
							</option>
							<option value="everyone_on_post">
								Everyone who can see the post
							</option>
						</Select>
					</div>
				</div>
			</Card.Body>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Posts placeholder
// ---------------------------------------------------------------------------

function PostsPlaceholder() {
	return (
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
					<h2 className="mt-4 text-lg font-semibold text-text">No posts yet</h2>
					<p className="mt-1 max-w-sm text-sm text-text-tertiary">
						When you start sharing, your posts will appear here on your profile.
					</p>
				</div>
			</Card.Body>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Inline editable text field
// ---------------------------------------------------------------------------

interface InlineTextFieldProps {
	profileId: string;
	field: keyof ProfileUpdateFields;
	value: string | null;
	placeholder: string;
	prefix?: string;
	className?: string;
	inputClassName?: string;
	maxLength?: number;
	pattern?: string;
}

function InlineTextField({
	profileId,
	field,
	value,
	placeholder,
	prefix,
	className = "",
	inputClassName = "",
	maxLength,
	pattern,
}: InlineTextFieldProps) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(value ?? "");
	const [showSuccess, setShowSuccess] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const updateProfile = useUpdateProfile();

	// Sync draft when value changes externally (e.g. after refetch)
	useEffect(() => {
		if (!editing) {
			setDraft(value ?? "");
		}
	}, [value, editing]);

	// Focus input when entering edit mode
	useEffect(() => {
		if (editing && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [editing]);

	const save = useCallback(() => {
		const trimmed = draft.trim();
		const newValue = trimmed === "" ? null : trimmed;

		// No change — just exit
		if (newValue === value) {
			setEditing(false);
			return;
		}

		updateProfile.mutate(
			{
				profileId,
				fields: { [field]: newValue },
			},
			{
				onSuccess: () => {
					setEditing(false);
					setShowSuccess(true);
					setTimeout(() => setShowSuccess(false), 1500);
				},
				onError: () => {
					// Stay in editing mode so the user can retry
				},
			},
		);
	}, [draft, value, field, profileId, updateProfile]);

	const cancel = useCallback(() => {
		setDraft(value ?? "");
		setEditing(false);
	}, [value]);

	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Enter") {
			e.preventDefault();
			save();
		} else if (e.key === "Escape") {
			cancel();
		}
	}

	if (editing) {
		return (
			<div className="flex items-center gap-2">
				{prefix && (
					<span className="text-text-placeholder select-none">{prefix}</span>
				)}
				<input
					ref={inputRef}
					type="text"
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onBlur={save}
					onKeyDown={handleKeyDown}
					maxLength={maxLength}
					pattern={pattern}
					className={`w-full rounded-md border border-border-focus bg-surface px-2 py-1 text-text outline-none ring-1 ring-border-focus transition-shadow ${inputClassName}`}
					disabled={updateProfile.isPending}
				/>
				{updateProfile.isPending && <Spinner size="xs" />}
			</div>
		);
	}

	const hasValue = value !== null && value !== "";

	return (
		<button
			type="button"
			onClick={() => setEditing(true)}
			className={`group flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left transition-colors hover:bg-surface-sunken ${className}`}
		>
			{prefix && hasValue && (
				<span className="text-text-placeholder select-none">{prefix}</span>
			)}
			<span className={hasValue ? "" : "italic text-text-placeholder"}>
				{hasValue ? value : placeholder}
			</span>
			{showSuccess ? (
				<svg
					className="h-3.5 w-3.5 shrink-0 text-success"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2.5}
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M4.5 12.75l6 6 9-13.5"
					/>
				</svg>
			) : (
				<svg
					className="h-3.5 w-3.5 shrink-0 text-text-placeholder opacity-0 transition-opacity group-hover:opacity-100"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
					/>
				</svg>
			)}
		</button>
	);
}

// ---------------------------------------------------------------------------
// Inline editable bio (multi-line textarea variant)
// ---------------------------------------------------------------------------

function InlineBioField({
	profileId,
	value,
}: {
	profileId: string;
	value: string | null;
}) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(value ?? "");
	const [showSuccess, setShowSuccess] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const updateProfile = useUpdateProfile();

	useEffect(() => {
		if (!editing) {
			setDraft(value ?? "");
		}
	}, [value, editing]);

	useEffect(() => {
		if (editing && textareaRef.current) {
			textareaRef.current.focus();
			// Move cursor to end
			const len = textareaRef.current.value.length;
			textareaRef.current.setSelectionRange(len, len);
		}
	}, [editing]);

	const save = useCallback(() => {
		const trimmed = draft.trim();
		const newValue = trimmed === "" ? null : trimmed;

		if (newValue === value) {
			setEditing(false);
			return;
		}

		updateProfile.mutate(
			{
				profileId,
				fields: { bio: newValue },
			},
			{
				onSuccess: () => {
					setEditing(false);
					setShowSuccess(true);
					setTimeout(() => setShowSuccess(false), 1500);
				},
			},
		);
	}, [draft, value, profileId, updateProfile]);

	const cancel = useCallback(() => {
		setDraft(value ?? "");
		setEditing(false);
	}, [value]);

	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			save();
		} else if (e.key === "Escape") {
			cancel();
		}
	}

	if (editing) {
		return (
			<div className="space-y-2">
				<Textarea
					ref={textareaRef}
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onKeyDown={handleKeyDown}
					maxLength={500}
					rows={3}
					placeholder="Write something about yourself..."
					className="resize-none"
				/>
				<div className="flex items-center justify-between">
					<span className="text-xs text-text-placeholder">
						{draft.length}/500 ·{" "}
						<span className="text-text-tertiary">⌘Enter</span> to save ·{" "}
						<span className="text-text-tertiary">Esc</span> to cancel
					</span>
					<div className="flex items-center gap-2">
						{updateProfile.isPending && <Spinner size="xs" />}
						<button
							type="button"
							onClick={cancel}
							className="rounded-md px-2.5 py-1 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-sunken"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={save}
							disabled={updateProfile.isPending}
							className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-50"
						>
							Save
						</button>
					</div>
				</div>
			</div>
		);
	}

	const hasValue = value !== null && value !== "";

	return (
		<button
			type="button"
			onClick={() => setEditing(true)}
			className="group flex w-full items-start gap-1.5 rounded-md px-2 py-1 text-left text-sm text-text-secondary transition-colors hover:bg-surface-sunken"
		>
			<span
				className={`flex-1 whitespace-pre-wrap ${!hasValue ? "italic text-text-placeholder" : ""}`}
			>
				{hasValue ? value : "Add a bio..."}
			</span>
			{showSuccess ? (
				<svg
					className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2.5}
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M4.5 12.75l6 6 9-13.5"
					/>
				</svg>
			) : (
				<svg
					className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-placeholder opacity-0 transition-opacity group-hover:opacity-100"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
					/>
				</svg>
			)}
		</button>
	);
}
