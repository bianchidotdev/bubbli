import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "./client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GroupResource {
	id: string;
	type: "group";
	attributes?: {
		name: string;
		description?: string | null;
		cover_image_url?: string | null;
		privacy: "public" | "private";
		inserted_at: string;
	};
}

export interface GroupMemberResource {
	id: string;
	type: "group_member";
	attributes?: {
		role: "admin" | "member";
	};
}

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const groupKeys = {
	all: ["groups"] as const,
	list: () => [...groupKeys.all, "list"] as const,
	detail: (id: string) => [...groupKeys.all, "detail", id] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** List all groups visible to the current user. */
export function useGroups() {
	return useQuery({
		queryKey: groupKeys.list(),
		queryFn: async () => {
			const { data, error } = await api.GET("/api/groups", {});
			if (error) throw error;
			return (data?.data ?? []) as GroupResource[];
		},
	});
}

/** Fetch a single group by ID. */
export function useGroup(id: string) {
	return useQuery({
		queryKey: groupKeys.detail(id),
		queryFn: async () => {
			const { data, error } = await api.GET("/api/groups/{id}", {
				params: { path: { id } },
			});
			if (error) throw error;
			return (data?.data ?? null) as GroupResource | null;
		},
		enabled: id.length > 0,
	});
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Create a new group. */
export function useCreateGroup() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			name,
			description,
			privacy,
		}: {
			name: string;
			description?: string;
			privacy?: "public" | "private";
		}) => {
			const { data, error } = await api.POST("/api/groups", {
				body: {
					data: {
						type: "group",
						attributes: {
							name,
							...(description != null ? { description } : {}),
							...(privacy != null ? { privacy } : {}),
						},
					},
				},
			});
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: groupKeys.all });
		},
	});
}

/** Join a group by creating a group membership. */
export function useJoinGroup() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (groupId: string) => {
			const { data, error } = await api.POST("/api/group-members", {
				body: {
					data: {
						type: "group_member",
						attributes: { group_id: groupId },
					},
				},
			});
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: groupKeys.all });
		},
	});
}

/** Leave a group by deleting the group membership. */
export function useLeaveGroup() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (memberId: string) => {
			const { error } = await api.DELETE("/api/group-members/{id}", {
				params: { path: { id: memberId } },
			});
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: groupKeys.all });
		},
	});
}
