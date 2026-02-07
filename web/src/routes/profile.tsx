import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import api from "../api/client";
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
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
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Profile
        </h1>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:outline-none"
          >
            <svg
              className="h-4 w-4 text-gray-500"
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
            Edit profile
          </button>
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
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Banner area */}
      <div className="h-28 bg-gradient-to-r from-violet-500 to-fuchsia-500" />

      {/* Avatar + name section */}
      <div className="relative px-6 pb-6">
        <div className="-mt-12 flex items-end gap-4">
          <Avatar
            displayName={user.display_name}
            email={user.email}
            avatarUrl={user.avatar_url}
            size="lg"
          />
          <div className="min-w-0 pb-1">
            <h2 className="truncate text-xl font-bold text-gray-900">
              {user.display_name || "No name set"}
            </h2>
            {user.handle && (
              <p className="truncate text-sm text-gray-500">@{user.handle}</p>
            )}
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="mt-4 text-sm leading-relaxed text-gray-600">
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
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">
        {label}
      </dt>
      <dd
        className={`mt-0.5 truncate text-sm font-medium ${muted ? "italic text-gray-400" : "text-gray-900"}`}
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
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Banner */}
      <div className="h-28 bg-gradient-to-r from-violet-500 to-fuchsia-500" />

      <div className="relative px-6 pb-6">
        <div className="-mt-12 mb-6">
          <Avatar
            displayName={form.display_name}
            email={user.email}
            avatarUrl={form.avatar_url}
            size="lg"
          />
        </div>

        {/* Feedback messages */}
        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <svg
              className="h-4 w-4 shrink-0 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium text-green-700">
              Profile updated successfully!
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Display name */}
          <FormField label="Display name" htmlFor="display_name">
            <input
              id="display_name"
              type="text"
              maxLength={100}
              value={form.display_name}
              onChange={(e) => updateField("display_name", e.target.value)}
              placeholder="Your display name"
              className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-sm transition-all placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
            />
          </FormField>

          {/* Handle */}
          <FormField
            label="Handle"
            htmlFor="handle"
            hint="Letters, numbers, and underscores only"
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                @
              </span>
              <input
                id="handle"
                type="text"
                maxLength={40}
                pattern="[a-zA-Z0-9_]+"
                value={form.handle}
                onChange={(e) => updateField("handle", e.target.value)}
                placeholder="your_handle"
                className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-3.5 pl-8 text-sm shadow-sm transition-all placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
              />
            </div>
          </FormField>

          {/* Bio */}
          <FormField label="Bio" htmlFor="bio" hint={`${form.bio.length}/500`}>
            <textarea
              id="bio"
              maxLength={500}
              rows={3}
              value={form.bio}
              onChange={(e) => updateField("bio", e.target.value)}
              placeholder="Tell people a little about yourself..."
              className="block w-full resize-none rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-sm transition-all placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
            />
          </FormField>

          {/* Avatar URL */}
          <FormField
            label="Avatar URL"
            htmlFor="avatar_url"
            hint="Paste a link to your profile picture"
          >
            <input
              id="avatar_url"
              type="url"
              value={form.avatar_url}
              onChange={(e) => updateField("avatar_url", e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-sm transition-all placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
            />
          </FormField>

          {/* Privacy settings */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <h3 className="text-sm font-semibold text-gray-900">Privacy</h3>

            <div className="mt-4 space-y-4">
              <FormField
                label="Who can see your profile?"
                htmlFor="profile_visibility"
              >
                <select
                  id="profile_visibility"
                  value={form.profile_visibility}
                  onChange={(e) =>
                    updateField(
                      "profile_visibility",
                      e.target.value as ProfileFormState["profile_visibility"],
                    )
                  }
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-sm transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                >
                  <option value="connections_only">Connections only</option>
                  <option value="public">Public</option>
                </select>
              </FormField>

              <FormField
                label="Who can comment on your posts?"
                htmlFor="comment_visibility"
              >
                <select
                  id="comment_visibility"
                  value={form.comment_visibility}
                  onChange={(e) =>
                    updateField(
                      "comment_visibility",
                      e.target.value as ProfileFormState["comment_visibility"],
                    )
                  }
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-sm transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                >
                  <option value="connections_and_group_members">
                    Connections & group members
                  </option>
                  <option value="everyone_on_post">
                    Everyone who can see the post
                  </option>
                </select>
              </FormField>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:outline-none disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared components
// ---------------------------------------------------------------------------

function Avatar({
  displayName,
  email,
  avatarUrl,
  size = "md",
}: {
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
  size?: "md" | "lg";
}) {
  const sizeClasses =
    size === "lg" ? "h-20 w-20 text-2xl" : "h-12 w-12 text-base";
  const ringClasses = size === "lg" ? "ring-4 ring-white" : "ring-2 ring-white";
  const initial =
    displayName?.[0]?.toUpperCase() ?? email[0]?.toUpperCase() ?? "?";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName ?? email}
        className={`${sizeClasses} ${ringClasses} rounded-full object-cover shadow-sm`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} ${ringClasses} flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 font-bold text-white shadow-sm`}
    >
      {initial}
    </div>
  );
}

function FormField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
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
