defmodule Bubbli.Social.Connection do
  use Ash.Resource,
    otp_app: :bubbli,
    domain: Bubbli.Social,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer],
    extensions: [AshJsonApi.Resource]

  json_api do
    type "connection"
    includes requester: [:profile], receiver: [:profile]

    routes do
      base "/connections"

      index :list_accepted
      index :list_pending_incoming, route: "/pending-incoming"
      index :list_pending_outgoing, route: "/pending-outgoing"
      get :read
      post :send_request
      patch :accept, route: "/:id/accept"
      patch :reject, route: "/:id/reject"
      delete :remove
    end
  end

  postgres do
    table "connections"
    repo Bubbli.Repo
  end

  actions do
    defaults [:read]

    read :list_accepted do
      description "List the current user's accepted connections"

      filter expr(
               status == :accepted and
                 (requester_id == ^actor(:id) or receiver_id == ^actor(:id))
             )
    end

    read :list_pending_incoming do
      description "List pending connection requests received by the current user"
      filter expr(status == :pending and receiver_id == ^actor(:id))
    end

    read :list_pending_outgoing do
      description "List pending connection requests sent by the current user"
      filter expr(status == :pending and requester_id == ^actor(:id))
    end

    create :send_request do
      description "Send a connection request to another user"
      accept []

      argument :receiver_id, :uuid do
        allow_nil? false
        description "The user to send the request to"
      end

      # Set the requester to the current actor via the relationship
      change relate_actor(:requester)

      # Set the receiver from the argument via the relationship
      # authorize?: false so we can look up the receiver even if the actor
      # can't normally "see" them (e.g. connections_only profile visibility)
      change manage_relationship(:receiver_id, :receiver,
               type: :append_and_remove,
               authorize?: false
             )

      # Always start as pending
      change set_attribute(:status, :pending)

      # Prevent self-connections
      validate {Bubbli.Social.Connection.Validations.NotSelfConnection, []}

      # Prevent duplicate connections (in either direction)
      validate {Bubbli.Social.Connection.Validations.NoDuplicateConnection, []}
    end

    update :accept do
      description "Accept a pending connection request"
      accept []
      # Can only accept pending requests
      validate attribute_equals(:status, :pending) do
        message "can only accept pending requests"
      end

      change set_attribute(:status, :accepted)
    end

    update :reject do
      description "Reject a pending connection request"
      accept []
      change set_attribute(:status, :rejected)

      validate attribute_equals(:status, :pending) do
        message "can only reject pending requests"
      end
    end

    destroy :remove do
      description "Remove an existing connection (either party can do this)"
    end
  end

  policies do
    # --- reads ---
    policy action_type(:read) do
      description "Users can only read connections they are part of"
      authorize_if expr(requester_id == ^actor(:id))
      authorize_if expr(receiver_id == ^actor(:id))
    end

    # --- send_request ---
    policy action(:send_request) do
      description "Any authenticated user can send a connection request"
      authorize_if actor_present()
    end

    # --- accept / reject ---
    policy action([:accept, :reject]) do
      description "Only the receiver can accept or reject a request"
      authorize_if expr(receiver_id == ^actor(:id))
    end

    # --- remove ---
    policy action(:remove) do
      description "Either party can remove a connection"
      authorize_if expr(requester_id == ^actor(:id))
      authorize_if expr(receiver_id == ^actor(:id))
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :status, :atom do
      allow_nil? false
      default :pending
      constraints one_of: [:pending, :accepted, :rejected]
      description "Current state of the connection request"
    end

    create_timestamp :inserted_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :requester, Bubbli.Accounts.User do
      allow_nil? false
      public? true
      description "The user who initiated the connection request"
    end

    belongs_to :receiver, Bubbli.Accounts.User do
      allow_nil? false
      public? true
      description "The user who received the connection request"
    end
  end

  identities do
    identity :unique_connection_pair, [:requester_id, :receiver_id],
      message: "a connection already exists between these users"
  end
end
