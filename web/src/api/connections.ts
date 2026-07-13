import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "./client";

// ---------------------------------------------------------------------------
// Types — derived from the JSON:API schema
// ---------------------------------------------------------------------------

/** A profile resource as returned in the JSON:API `included` array. */
export interface ProfileResource {
	id: string;
	type: "profile";
	attributes?: {
		display_name?: string | null;
		handle?: string | null;
		bio?: string | null;
		avatar_url?: string | null;
		location?: string | null;
		profile_visibility?: "connections_only" | "public";
		comment_visibility?: "connections_and_group_members" | "everyone_on_post";
	};
}

/** A user object as returned by the JSON:API `included` array or search results. */
export interface UserResource {
	id: string;
	type: "user";
	attributes?: {
		email?: string;
	};
	relationships?: {
		profile?: { data?: { id: string; type: "profile" } | null };
	};
	/** Resolved after processing the `included` array — not part of the raw payload. */
	resolvedProfile?: ProfileResource | null;
}

/** Lifecycle state of a connection request. */
export type ConnectionRequestStatus =
	| "pending"
	| "accepted"
	| "rejected"
	| "cancelled";

/** A connection request resource as returned by the JSON:API. */
export interface ConnectionRequestResource {
	id: string;
	type: string;
	attributes?: {
		requester_id?: string;
		receiver_id?: string;
		status?: ConnectionRequestStatus;
	};
	relationships?: {
		requester?: { data?: { id: string; type: string } | null };
		receiver?: { data?: { id: string; type: string } | null };
	};
}

/** A connection request with its resolved requester and receiver user data. */
export interface ResolvedConnectionRequest {
	id: string;
	status: ConnectionRequestStatus;
	requesterId: string;
	receiverId: string;
	requester: UserResource | null;
	receiver: UserResource | null;
}

/** An established connection resource as returned by the JSON:API. */
export interface ConnectionResource {
	id: string;
	type: string;
	relationships?: {
		peer?: { data?: { id: string; type: string } | null };
	};
}

/** A connection with its resolved peer (the connected user). */
export interface ResolvedConnection {
	id: string;
	peer: UserResource | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type IncludedResource =
	| UserResource
	| ProfileResource
	| { id: string; type: string; [k: string]: unknown };

/**
 * Given an array of JSON:API included resources, find and attach each user's
 * resolved profile so consumers can access `user.resolvedProfile`.
 */
function attachProfiles(
	users: UserResource[],
	included: IncludedResource[],
): UserResource[] {
	const profiles = included.filter(
		(r): r is ProfileResource => r.type === "profile",
	);

	return users.map((user) => {
		const profileRef = user.relationships?.profile?.data;
		const profile = profileRef
			? (profiles.find((p) => p.id === profileRef.id) ?? null)
			: null;
		return { ...user, resolvedProfile: profile };
	});
}

/** Resolve a connection request's requester/receiver against `included`. */
function resolveRequest(
	request: ConnectionRequestResource,
	included: IncludedResource[],
): ResolvedConnectionRequest {
	const users = included.filter((r): r is UserResource => r.type === "user");
	const resolvedUsers = attachProfiles(users, included);

	const requesterId =
		request.relationships?.requester?.data?.id ??
		request.attributes?.requester_id ??
		"";
	const receiverId =
		request.relationships?.receiver?.data?.id ??
		request.attributes?.receiver_id ??
		"";

	return {
		id: request.id,
		status: request.attributes?.status ?? "pending",
		requesterId,
		receiverId,
		requester: resolvedUsers.find((u) => u.id === requesterId) ?? null,
		receiver: resolvedUsers.find((u) => u.id === receiverId) ?? null,
	};
}

/** Resolve a connection's `peer` (the connected user) against `included`. */
function resolveConnection(
	connection: ConnectionResource,
	included: IncludedResource[],
): ResolvedConnection {
	const users = included.filter((r): r is UserResource => r.type === "user");
	const resolvedUsers = attachProfiles(users, included);

	const peerId = connection.relationships?.peer?.data?.id ?? "";

	return {
		id: connection.id,
		peer: resolvedUsers.find((u) => u.id === peerId) ?? null,
	};
}

/**
 * Given a resolved connection request and the current user's ID, return the
 * "other" user in the request (the one who isn't the current user).
 */
export function otherUser(
	request: ResolvedConnectionRequest,
	currentUserId: string,
): UserResource | null {
	return request.requesterId === currentUserId
		? request.receiver
		: request.requester;
}

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const connectionKeys = {
	all: ["connections"] as const,
	connections: () => [...connectionKeys.all, "list"] as const,
	incoming: () => [...connectionKeys.all, "requests", "incoming"] as const,
	outgoing: () => [...connectionKeys.all, "requests", "outgoing"] as const,
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
				params: { query: { query, include: "profile" } },
			});
			if (error) throw error;

			const rawUsers = (data?.data ?? []) as UserResource[];
			const included = (data?.included ?? []) as IncludedResource[];
			return attachProfiles(rawUsers, included);
		},
		enabled: query.trim().length >= 1,
		staleTime: 1000 * 30,
		placeholderData: (prev) => prev,
	});
}

/**
 * List the current user's established connections.
 * Includes each connected peer along with their profile.
 */
export function useConnections() {
	return useQuery({
		queryKey: connectionKeys.connections(),
		queryFn: async () => {
			const { data, error } = await api.GET("/api/connections", {
				params: { query: { include: "peer.profile" } },
			});
			if (error) throw error;
			const connections = (data?.data ?? []) as ConnectionResource[];
			const included = (data?.included ?? []) as IncludedResource[];
			return connections.map((c) => resolveConnection(c, included));
		},
	});
}

/** List pending incoming connection requests (current user is the receiver). */
export function usePendingIncoming() {
	return useQuery({
		queryKey: connectionKeys.incoming(),
		queryFn: async () => {
			const { data, error } = await api.GET(
				"/api/connection-requests/incoming",
				{
					params: {
						query: { include: "requester.profile,receiver.profile" },
					},
				},
			);
			if (error) throw error;
			const requests = (data?.data ?? []) as ConnectionRequestResource[];
			const included = (data?.included ?? []) as IncludedResource[];
			return requests.map((r) => resolveRequest(r, included));
		},
	});
}

/** List pending outgoing connection requests (current user is the requester). */
export function usePendingOutgoing() {
	return useQuery({
		queryKey: connectionKeys.outgoing(),
		queryFn: async () => {
			const { data, error } = await api.GET(
				"/api/connection-requests/outgoing",
				{
					params: {
						query: { include: "requester.profile,receiver.profile" },
					},
				},
			);
			if (error) throw error;
			const requests = (data?.data ?? []) as ConnectionRequestResource[];
			const included = (data?.included ?? []) as IncludedResource[];
			return requests.map((r) => resolveRequest(r, included));
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
			const { data, error } = await api.POST("/api/connection-requests", {
				body: {
					data: {
						type: "connection_request",
						attributes: { receiver_id: receiverId },
					},
				},
			});
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: connectionKeys.all });
		},
	});
}

/** Accept a pending connection request, establishing a mutual connection. */
export function useAcceptConnection() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (requestId: string) => {
			const { data, error } = await api.PATCH(
				"/api/connection-requests/{id}/accept",
				{
					params: { path: { id: requestId } },
					body: {
						data: { id: requestId, type: "connection_request", attributes: {} },
					},
				},
			);
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: connectionKeys.all });
		},
	});
}

/** Reject a pending incoming connection request. */
export function useRejectConnection() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (requestId: string) => {
			const { data, error } = await api.PATCH(
				"/api/connection-requests/{id}/reject",
				{
					params: { path: { id: requestId } },
					body: {
						data: { id: requestId, type: "connection_request", attributes: {} },
					},
				},
			);
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: connectionKeys.all });
		},
	});
}

/** Cancel (withdraw) a pending outgoing connection request. */
export function useCancelConnectionRequest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (requestId: string) => {
			const { data, error } = await api.PATCH(
				"/api/connection-requests/{id}/cancel",
				{
					params: { path: { id: requestId } },
					body: {
						data: { id: requestId, type: "connection_request", attributes: {} },
					},
				},
			);
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: connectionKeys.all });
		},
	});
}

/** Remove an established connection. */
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
			queryClient.invalidateQueries({ queryKey: connectionKeys.all });
		},
	});
}
