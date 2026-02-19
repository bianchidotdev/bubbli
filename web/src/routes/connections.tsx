import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
	otherUser,
	type UserResource,
	useAcceptConnection,
	useConnections,
	usePendingIncoming,
	usePendingOutgoing,
	useRejectConnection,
	useRemoveConnection,
	useSearchUsers,
	useSendConnectionRequest,
} from "../api/connections";
import {
	Alert,
	Badge,
	Button,
	Card,
	EmptyState,
	Input,
	Spinner,
	Tab,
	TabList,
} from "../components/ui";
import { UserRow } from "../components/user-row";
import { useAuth } from "../lib/auth";

export const Route = createFileRoute("/connections")({
	component: ConnectionsPage,
});

// ---------------------------------------------------------------------------
// Icons — small inline SVGs reused across the page
// ---------------------------------------------------------------------------

function SearchIcon() {
	return (
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
				d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
			/>
		</svg>
	);
}

function ClearIcon() {
	return (
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
				d="M6 18L18 6M6 6l12 12"
			/>
		</svg>
	);
}

function PlusIcon() {
	return (
		<svg
			className="h-3.5 w-3.5"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			strokeWidth={2.5}
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 4.5v15m7.5-7.5h-15"
			/>
		</svg>
	);
}

function CheckIcon() {
	return (
		<svg
			className="h-3.5 w-3.5"
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
	);
}

function RemoveUserIcon() {
	return (
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
				d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766z"
			/>
		</svg>
	);
}

// ---------------------------------------------------------------------------
// Route guard
// ---------------------------------------------------------------------------

function ConnectionsPage() {
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

	return <ConnectionsContent userId={user.id} />;
}

// ---------------------------------------------------------------------------
// Main content
// ---------------------------------------------------------------------------

type MainTab = "friends" | "requests";

function ConnectionsContent({ userId }: { userId: string }) {
	const [tab, setTab] = useState<MainTab>("friends");
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	const isSearching = debouncedQuery.trim().length >= 1;

	const pendingIncoming = usePendingIncoming();
	const incomingCount = pendingIncoming.data?.length ?? 0;

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			{/* Page header */}
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-text">
					Connections
				</h1>
				<p className="mt-1 text-sm text-text-tertiary">
					Manage your friends and connection requests.
				</p>
			</div>

			{/* Search bar */}
			<Input
				type="text"
				placeholder="Search users by handle or name…"
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				leadingAddon={<SearchIcon />}
				trailingAddon={
					searchQuery ? (
						<button
							type="button"
							onClick={() => setSearchQuery("")}
							className="rounded p-0.5 text-text-placeholder transition-colors hover:text-text"
						>
							<ClearIcon />
						</button>
					) : null
				}
			/>

			{/* Conditional: search results OR tabbed content */}
			{isSearching ? (
				<SearchResults
					query={debouncedQuery}
					userId={userId}
					onClear={() => setSearchQuery("")}
				/>
			) : (
				<>
					<TabList variant="pill">
						<Tab active={tab === "friends"} onClick={() => setTab("friends")}>
							Friends
						</Tab>
						<Tab active={tab === "requests"} onClick={() => setTab("requests")}>
							Requests
							{incomingCount > 0 && (
								<Badge variant="danger" size="sm" className="ml-1.5">
									{incomingCount}
								</Badge>
							)}
						</Tab>
					</TabList>

					{tab === "friends" ? (
						<FriendsTab userId={userId} />
					) : (
						<RequestsTab userId={userId} />
					)}
				</>
			)}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Search results
// ---------------------------------------------------------------------------

function SearchResults({
	query,
	userId,
	onClear,
}: {
	query: string;
	userId: string;
	onClear: () => void;
}) {
	const { data: users, isLoading, isError } = useSearchUsers(query);
	const sendRequest = useSendConnectionRequest();
	const connections = useConnections();
	const pendingOutgoing = usePendingOutgoing();
	const pendingIncoming = usePendingIncoming();

	// Build lookup sets for relationship status
	const connectedIds = new Set<string>();
	const pendingOutIds = new Set<string>();
	const pendingInIds = new Set<string>();

	for (const c of connections.data ?? []) {
		const other = otherUser(c, userId);
		if (other) connectedIds.add(other.id);
	}
	for (const c of pendingOutgoing.data ?? []) {
		const other = otherUser(c, userId);
		if (other) pendingOutIds.add(other.id);
	}
	for (const c of pendingIncoming.data ?? []) {
		const other = otherUser(c, userId);
		if (other) pendingInIds.add(other.id);
	}

	function statusFor(
		uid: string,
	): "connected" | "pending-out" | "pending-in" | "none" {
		if (connectedIds.has(uid)) return "connected";
		if (pendingOutIds.has(uid)) return "pending-out";
		if (pendingInIds.has(uid)) return "pending-in";
		return "none";
	}

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Spinner size="md" />
			</div>
		);
	}

	if (isError) {
		return (
			<Alert status="error">
				Something went wrong while searching. Please try again.
			</Alert>
		);
	}

	if (!users || users.length === 0) {
		return (
			<Card variant="outlined" className="border-dashed">
				<Card.Body>
					<EmptyState
						icon={
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
							/>
						}
						title={`No users found for "${query}"`}
						description="Try a different search term or check the spelling."
						action={
							<Button variant="ghost" size="sm" onClick={onClear}>
								Clear search
							</Button>
						}
					/>
				</Card.Body>
			</Card>
		);
	}

	return (
		<div className="space-y-2">
			<p className="text-xs font-medium text-text-tertiary">
				{users.length} result{users.length !== 1 ? "s" : ""}
			</p>
			<div className="space-y-2">
				{users.map((user) => (
					<SearchResultRow
						key={user.id}
						user={user}
						status={statusFor(user.id)}
						onConnect={() => sendRequest.mutate(user.id)}
						isSending={
							sendRequest.isPending && sendRequest.variables === user.id
						}
					/>
				))}
			</div>
		</div>
	);
}

function SearchResultRow({
	user,
	status,
	onConnect,
	isSending,
}: {
	user: UserResource;
	status: "connected" | "pending-out" | "pending-in" | "none";
	onConnect: () => void;
	isSending: boolean;
}) {
	const profile = user.resolvedProfile?.attributes;

	const trailing = (() => {
		switch (status) {
			case "connected":
				return (
					<Badge variant="success" size="sm">
						Connected
					</Badge>
				);
			case "pending-out":
				return (
					<Badge variant="info" size="sm">
						Request sent
					</Badge>
				);
			case "pending-in":
				return (
					<Badge variant="warning" size="sm">
						Wants to connect
					</Badge>
				);
			case "none":
				return (
					<Button
						variant="primary"
						size="sm"
						onClick={onConnect}
						loading={isSending}
						iconLeft={<PlusIcon />}
					>
						Connect
					</Button>
				);
		}
	})();

	return (
		<Card variant="flat">
			<Card.Body>
				<UserRow
					displayName={profile?.display_name}
					handle={profile?.handle}
					email={user.attributes?.email}
					avatarUrl={profile?.avatar_url}
					trailing={trailing}
				/>
			</Card.Body>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Friends tab
// ---------------------------------------------------------------------------

function FriendsTab({ userId }: { userId: string }) {
	const { data: connections, isLoading, isError } = useConnections();
	const removeConnection = useRemoveConnection();
	const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Spinner size="md" />
			</div>
		);
	}

	if (isError) {
		return (
			<Alert status="error">
				Failed to load your connections. Please try again.
			</Alert>
		);
	}

	if (!connections || connections.length === 0) {
		return (
			<Card variant="outlined" className="border-dashed">
				<Card.Body>
					<EmptyState
						size="lg"
						icon={
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
							/>
						}
						title="No connections yet"
						description="Search for people above to send connection requests and start building your network."
					/>
				</Card.Body>
			</Card>
		);
	}

	return (
		<div className="space-y-2">
			{connections.map((connection) => {
				const friend = otherUser(connection, userId);
				if (!friend) return null;

				const isConfirming = confirmRemoveId === connection.id;
				const isRemoving =
					removeConnection.isPending &&
					removeConnection.variables === connection.id;

				const trailing = isConfirming ? (
					<>
						<span className="text-xs text-text-secondary">Remove?</span>
						<Button
							variant="danger"
							size="sm"
							loading={isRemoving}
							onClick={() => {
								removeConnection.mutate(connection.id, {
									onSettled: () => setConfirmRemoveId(null),
								});
							}}
						>
							Yes
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setConfirmRemoveId(null)}
						>
							No
						</Button>
					</>
				) : (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setConfirmRemoveId(connection.id)}
						iconLeft={<RemoveUserIcon />}
					>
						Remove
					</Button>
				);

				return (
					<Card key={connection.id} variant="flat">
						<Card.Body>
							<UserRow
								displayName={friend.resolvedProfile?.attributes?.display_name}
								handle={friend.resolvedProfile?.attributes?.handle}
								email={friend.attributes?.email}
								avatarUrl={friend.resolvedProfile?.attributes?.avatar_url}
								trailing={trailing}
							/>
						</Card.Body>
					</Card>
				);
			})}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Requests tab
// ---------------------------------------------------------------------------

type RequestSubTab = "incoming" | "outgoing";

function RequestsTab({ userId }: { userId: string }) {
	const [subTab, setSubTab] = useState<RequestSubTab>("incoming");

	return (
		<div className="space-y-4">
			<TabList variant="underline">
				<Tab
					active={subTab === "incoming"}
					onClick={() => setSubTab("incoming")}
				>
					Incoming
				</Tab>
				<Tab
					active={subTab === "outgoing"}
					onClick={() => setSubTab("outgoing")}
				>
					Outgoing
				</Tab>
			</TabList>

			{subTab === "incoming" ? (
				<IncomingRequests userId={userId} />
			) : (
				<OutgoingRequests userId={userId} />
			)}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Incoming requests
// ---------------------------------------------------------------------------

function IncomingRequests({ userId }: { userId: string }) {
	const { data: requests, isLoading, isError } = usePendingIncoming();
	const acceptConnection = useAcceptConnection();
	const rejectConnection = useRejectConnection();

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Spinner size="md" />
			</div>
		);
	}

	if (isError) {
		return (
			<Alert status="error">
				Failed to load incoming requests. Please try again.
			</Alert>
		);
	}

	if (!requests || requests.length === 0) {
		return (
			<Card variant="outlined" className="border-dashed">
				<Card.Body>
					<EmptyState
						icon={
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
							/>
						}
						title="No incoming requests"
						description="When someone sends you a connection request, it will appear here."
					/>
				</Card.Body>
			</Card>
		);
	}

	return (
		<div className="space-y-2">
			{requests.map((request) => {
				const sender = otherUser(request, userId);
				if (!sender) return null;

				const isAccepting =
					acceptConnection.isPending &&
					acceptConnection.variables === request.id;
				const isRejecting =
					rejectConnection.isPending &&
					rejectConnection.variables === request.id;
				const isBusy = isAccepting || isRejecting;

				return (
					<Card key={request.id} variant="flat">
						<Card.Body>
							<UserRow
								displayName={sender.resolvedProfile?.attributes?.display_name}
								handle={sender.resolvedProfile?.attributes?.handle}
								email={sender.attributes?.email}
								avatarUrl={sender.resolvedProfile?.attributes?.avatar_url}
								trailing={
									<>
										<Button
											variant="primary"
											size="sm"
											loading={isAccepting}
											disabled={isBusy}
											onClick={() => acceptConnection.mutate(request.id)}
											iconLeft={<CheckIcon />}
										>
											Accept
										</Button>
										<Button
											variant="ghost"
											size="sm"
											loading={isRejecting}
											disabled={isBusy}
											onClick={() => rejectConnection.mutate(request.id)}
										>
											Decline
										</Button>
									</>
								}
							/>
						</Card.Body>
					</Card>
				);
			})}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Outgoing requests
// ---------------------------------------------------------------------------

function OutgoingRequests({ userId }: { userId: string }) {
	const { data: requests, isLoading, isError } = usePendingOutgoing();
	const removeConnection = useRemoveConnection();

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Spinner size="md" />
			</div>
		);
	}

	if (isError) {
		return (
			<Alert status="error">
				Failed to load outgoing requests. Please try again.
			</Alert>
		);
	}

	if (!requests || requests.length === 0) {
		return (
			<Card variant="outlined" className="border-dashed">
				<Card.Body>
					<EmptyState
						icon={
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
							/>
						}
						title="No outgoing requests"
						description="When you send someone a connection request, it will appear here until they respond."
					/>
				</Card.Body>
			</Card>
		);
	}

	return (
		<div className="space-y-2">
			{requests.map((request) => {
				const recipient = otherUser(request, userId);
				if (!recipient) return null;

				const isCancelling =
					removeConnection.isPending &&
					removeConnection.variables === request.id;

				return (
					<Card key={request.id} variant="flat">
						<Card.Body>
							<UserRow
								displayName={
									recipient.resolvedProfile?.attributes?.display_name
								}
								handle={recipient.resolvedProfile?.attributes?.handle}
								email={recipient.attributes?.email}
								avatarUrl={recipient.resolvedProfile?.attributes?.avatar_url}
								trailing={
									<>
										<Badge variant="info" size="sm">
											Pending
										</Badge>
										<Button
											variant="ghost"
											size="sm"
											loading={isCancelling}
											onClick={() => removeConnection.mutate(request.id)}
										>
											Cancel
										</Button>
									</>
								}
							/>
						</Card.Body>
					</Card>
				);
			})}
		</div>
	);
}
