import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "./client";

// ---------------------------------------------------------------------------
// Types — derived from the JSON:API schema
// ---------------------------------------------------------------------------

/** A user object as returned by the JSON:API `included` array or search results. */
export interface UserResource {
	id: string;
	type: string;
	attributes?: {
		email?: string;
		display_name?: string | null;
		handle?: string | null;
		bio?: string | null;
		avatar_url?: string | null;
		profile_visibility?: "connections_only" | "public";
		comment_visibility?: "connections_and_group_members" | "everyone_on_post";
	};
}

/** A connection resource as returned by the JSON:API. */
export interface ConnectionResource {
	id: string;
	type: string;
	attributes?: {
		requester_id: string;
		receiver_id: string;
	};
	relationships?: {
		requester?: { data?: { id: string; type: string } | null };
		receiver?: { data?: { id: string; type: string } | null };
	};
}

/** A connection with its resolved requester and receiver user data. */
export interface ResolvedConnection {
	id: string;
	requesterId: string;
	receiverId: string;
	requester: UserResource | null;
	receiver: UserResource | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolve relationship references against the JSON:API `included` array.
 */
function resolveIncluded(
	connection: ConnectionResource,
	included: unknown[],
): ResolvedConnection {
	const users = (included ?? []) as UserResource[];

	const requesterId =
		connection.relationships?.requester?.data?.id ??
		connection.attributes?.requester_id ??
		"";
	const receiverId =
		connection.relationships?.receiver?.data?.id ??
		connection.attributes?.receiver_id ??
		"";

	const requester = users.find((u) => u.id === requesterId) ?? null;
	const receiver = users.find((u) => u.id === receiverId) ?? null;

	return {
		id: connection.id,
		requesterId,
		receiverId,
		requester,
		receiver,
	};
}

/**
 * Given a resolved connection and the current user's ID, return the "other"
 * user in the connection (the one who isn't the current user).
 */
export function otherUser(
	connection: ResolvedConnection,
	currentUserId: string,
): UserResource | null {
	return connection.requesterId === currentUserId
		? connection.receiver
		: connection.requester;
}

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const connectionKeys = {
	all: ["connections"] as const,
	accepted: () => [...connectionKeys.all, "accepted"] as const,
	pendingIncoming: () => [...connectionKeys.all, "pending-incoming"] as const,
	pendingOutgoing: () => [...connectionKeys.all, "pending-outgoing"] as const,
	search: (query: string) => ["user-search", query] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Search for users by handle or display name.
 * Only runs when `query` is at least 1 character.
 */
export function useSearchUsers(query: string) {
	return useQuery({
		queryKey: connectionKeys.search(query),
		queryFn: async () => {
			const { data, error } = await api.GET("/api/users/search", {
				params: { query: { query } },
			});
			if (error) throw error;
			return (data?.data ?? []) as UserResource[];
		},
		enabled: query.trim().length >= 1,
		staleTime: 1000 * 30,
		placeholderData: (prev) => prev,
	});
}

/**
 * List accepted connections for the current user.
 * Includes requester and receiver user data.
 */
export function useConnections() {
	return useQuery({
		queryKey: connectionKeys.accepted(),
		queryFn: async () => {
			const { data, error } = await api.GET("/api/connections", {
				params: { query: { include: "requester,receiver" } },
			});
			if (error) throw error;
			const connections = (data?.data ?? []) as ConnectionResource[];
			const included = (data?.included ?? []) as unknown[];
			return connections.map((c) => resolveIncluded(c, included));
		},
	});
}

/** List pending incoming connection requests (current user is the receiver). */
export function usePendingIncoming() {
	return useQuery({
		queryKey: connectionKeys.pendingIncoming(),
		queryFn: async () => {
			const { data, error } = await api.GET(
				"/api/connections/pending-incoming",
				{
					params: { query: { include: "requester,receiver" } },
				},
			);
			if (error) throw error;
			const connections = (data?.data ?? []) as ConnectionResource[];
			const included = (data?.included ?? []) as unknown[];
			return connections.map((c) => resolveIncluded(c, included));
		},
	});
}

/** List pending outgoing connection requests (current user is the requester). */
export function usePendingOutgoing() {
	return useQuery({
		queryKey: connectionKeys.pendingOutgoing(),
		queryFn: async () => {
			const { data, error } = await api.GET(
				"/api/connections/pending-outgoing",
				{
					params: { query: { include: "requester,receiver" } },
				},
			);
			if (error) throw error;
			const connections = (data?.data ?? []) as ConnectionResource[];
			const included = (data?.included ?? []) as unknown[];
			return connections.map((c) => resolveIncluded(c, included));
		},
	});
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Send a connection request to another user. */
export function useSendConnectionRequest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (receiverId: string) => {
			const { data, error } = await api.POST("/api/connections", {
				body: {
					data: {
						type: "connection",
						attributes: { receiver_id: receiverId },
					},
				},
			});
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: connectionKeys.all,
			});
		},
	});
}

/** Accept a pending connection request. */
export function useAcceptConnection() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (connectionId: string) => {
			const { data, error } = await api.PATCH("/api/connections/{id}/accept", {
				params: { path: { id: connectionId } },
				body: {
					data: {
						id: connectionId,
						type: "connection",
						attributes: {},
					},
				},
			});
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: connectionKeys.all,
			});
		},
	});
}

/** Reject a pending connection request. */
export function useRejectConnection() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (connectionId: string) => {
			const { data, error } = await api.PATCH("/api/connections/{id}/reject", {
				params: { path: { id: connectionId } },
				body: {
					data: {
						id: connectionId,
						type: "connection",
						attributes: {},
					},
				},
			});
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: connectionKeys.all,
			});
		},
	});
}

/** Remove an existing connection (either party can do this). */
export function useRemoveConnection() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (connectionId: string) => {
			const { error } = await api.DELETE("/api/connections/{id}", {
				params: { path: { id: connectionId } },
			});
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: connectionKeys.all,
			});
		},
	});
}
