import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "./client";
import type { ProfileResource, UserResource } from "./connections";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PostAudienceResource {
	id: string;
	type: "post_audience";
	attributes?: {
		type: "public" | "connections" | "circle" | "group" | "private";
		circle_id?: string | null;
		group_id?: string | null;
	};
}

export interface PostResource {
	id: string;
	type: "post";
	attributes?: {
		body: string;
		inserted_at: string;
		updated_at: string;
	};
	relationships?: {
		author?: { data?: { id: string; type: "user" } | null };
		post_audiences?: {
			data?: Array<{ id: string; type: "post_audience" }>;
		};
	};
}

/** A post with resolved author and audience data from the JSON:API `included` array. */
export interface ResolvedPost {
	id: string;
	body: string;
	insertedAt: string;
	updatedAt: string;
	author: (UserResource & { resolvedProfile?: ProfileResource | null }) | null;
	audiences: PostAudienceResource[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type IncludedResource =
	| UserResource
	| ProfileResource
	| PostAudienceResource
	| { id: string; type: string; [k: string]: unknown };

function resolvePost(
	post: PostResource,
	included: IncludedResource[],
): ResolvedPost {
	const users = included.filter((r): r is UserResource => r.type === "user");
	const profiles = included.filter(
		(r): r is ProfileResource => r.type === "profile",
	);
	const audiences = included.filter(
		(r): r is PostAudienceResource => r.type === "post_audience",
	);

	// Resolve the author and attach their profile
	const authorRef = post.relationships?.author?.data;
	let author: ResolvedPost["author"] = null;
	if (authorRef) {
		const user = users.find((u) => u.id === authorRef.id) ?? null;
		if (user) {
			const profileRef = user.relationships?.profile?.data;
			const profile = profileRef
				? (profiles.find((p) => p.id === profileRef.id) ?? null)
				: null;
			author = { ...user, resolvedProfile: profile };
		}
	}

	// Resolve audience resources
	const audienceRefs = post.relationships?.post_audiences?.data ?? [];
	const resolvedAudiences = audienceRefs
		.map((ref) => audiences.find((a) => a.id === ref.id))
		.filter((a): a is PostAudienceResource => a != null);

	return {
		id: post.id,
		body: post.attributes?.body ?? "",
		insertedAt: post.attributes?.inserted_at ?? "",
		updatedAt: post.attributes?.updated_at ?? "",
		author,
		audiences: resolvedAudiences,
	};
}

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const postKeys = {
	all: ["posts"] as const,
	feed: () => [...postKeys.all, "feed"] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch the current user's feed with resolved authors and audiences. */
export function useFeed() {
	return useQuery({
		queryKey: postKeys.feed(),
		queryFn: async () => {
			const { data, error } = await api.GET("/api/posts/feed", {
				params: {
					query: { include: "author.profile,post_audiences" },
				},
			});
			if (error) throw error;

			const posts = (data?.data ?? []) as PostResource[];
			const included = (data?.included ?? []) as IncludedResource[];
			return posts.map((p) => resolvePost(p, included));
		},
	});
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Create a new post with one or more audience targets. */
export function useCreatePost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			body,
			audiences,
		}: {
			body: string;
			audiences: Array<{
				type: string;
				circle_id?: string;
				group_id?: string;
			}>;
		}) => {
			const { data, error } = await api.POST("/api/posts", {
				body: {
					data: {
						type: "post",
						attributes: { body, audiences },
					},
				},
			});
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: postKeys.all });
		},
	});
}

/** Delete a post by ID. */
export function useDeletePost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (postId: string) => {
			const { error } = await api.DELETE("/api/posts/{id}", {
				params: { path: { id: postId } },
			});
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: postKeys.all });
		},
	});
}
