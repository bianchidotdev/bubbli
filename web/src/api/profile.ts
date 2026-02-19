import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getToken, meQueryKey } from "../lib/auth";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Fields that can be updated on a profile via inline editing. */
export interface ProfileUpdateFields {
	display_name?: string | null;
	handle?: string | null;
	bio?: string | null;
	avatar_url?: string | null;
	location?: string | null;
	profile_visibility?: "connections_only" | "public";
	comment_visibility?: "connections_and_group_members" | "everyone_on_post";
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Update one or more fields on the current user's profile.
 *
 * Uses raw fetch instead of the openapi-fetch client because the generated
 * schema doesn't include the new `/api/profiles` routes yet. Once the schema
 * is regenerated from the running server this can be switched back to `api.PATCH`.
 *
 * On success the `/me` query is invalidated so the auth context
 * picks up the updated profile automatically.
 */
export function useUpdateProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			profileId,
			fields,
		}: {
			profileId: string;
			fields: ProfileUpdateFields;
		}) => {
			const token = getToken();
			const res = await fetch(`/api/profiles/${profileId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/vnd.api+json",
					Accept: "application/vnd.api+json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({
					data: {
						id: profileId,
						type: "profile",
						attributes: fields,
					},
				}),
			});

			if (!res.ok) {
				const body = await res.json().catch(() => null);
				const message =
					body?.errors?.[0]?.detail ??
					body?.errors?.[0]?.title ??
					"Failed to update profile";
				throw new Error(message);
			}

			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: meQueryKey });
		},
	});
}
