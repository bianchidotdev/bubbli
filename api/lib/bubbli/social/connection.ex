defmodule Bubbli.Social.Connection do
  use Ash.Resource,
    otp_app: :bubbli,
    domain: Bubbli.Social,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer],
    extensions: [AshJsonApi.Resource]

  @moduledoc """
  An established, mutual connection between two users.

  A connection is symmetric, but stored as two directional adjacency edges
  (`user_id -> peer_id` and the mirror) so that "is A connected to B?" is always
  a single `exists(connections, peer_id == ^b)` lookup, in any direction.

  Connections are never created directly: they are established when a
  `Bubbli.Social.ConnectionRequest` is accepted.
  """

  json_api do
    type "connection"
    includes peer: [:profile]

    routes do
      base "/connections"

      index :list
      get :read
      delete :remove
    end
  end

  postgres do
    table "connections"
    repo Bubbli.Repo
  end

  actions do
    defaults [:read]

    read :list do
      description "List the current user's connections"
      filter expr(user_id == ^actor(:id))
    end

    create :establish do
      description "Internal: create one directional edge (use ConnectionRequest.accept)"
      accept []

      argument :user_id, :uuid, allow_nil?: false
      argument :peer_id, :uuid, allow_nil?: false

      change fn changeset, _context ->
        changeset
        |> Ash.Changeset.force_change_attribute(
          :user_id,
          Ash.Changeset.get_argument(changeset, :user_id)
        )
        |> Ash.Changeset.force_change_attribute(
          :peer_id,
          Ash.Changeset.get_argument(changeset, :peer_id)
        )
      end
    end

    destroy :remove do
      description "Remove a connection: deletes both edges and any shared circle memberships"
      require_atomic? false
      change {Bubbli.Social.Connection.Changes.RemoveMirrorAndCircles, []}
    end

    destroy :delete_edge do
      description "Internal: delete a single edge without cascading"
    end
  end

  policies do
    policy action_type(:read) do
      description "Users can read their own connection edges"
      authorize_if expr(user_id == ^actor(:id))
    end

    policy action(:remove) do
      description "A user can remove a connection edge they own"
      authorize_if expr(user_id == ^actor(:id))
    end

    # `establish` and `delete_edge` are internal-only and always run with
    # `authorize?: false`, which bypasses policies. Forbidding here ensures they
    # can never be reached through an authorized (e.g. API) call.
    policy action([:establish, :delete_edge]) do
      forbid_if always()
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :user_id, :uuid do
      allow_nil? false
    end

    attribute :peer_id, :uuid do
      allow_nil? false
    end

    create_timestamp :inserted_at
  end

  relationships do
    belongs_to :user, Bubbli.Accounts.User do
      allow_nil? false
      define_attribute? false
      source_attribute :user_id
      description "The user this edge belongs to"
    end

    belongs_to :peer, Bubbli.Accounts.User do
      allow_nil? false
      public? true
      define_attribute? false
      source_attribute :peer_id
      description "The connected user"
    end
  end

  identities do
    identity :unique_edge, [:user_id, :peer_id], message: "this connection already exists"
  end
end
