defmodule Bubbli.Social.ConnectionRequest do
  use Ash.Resource,
    otp_app: :bubbli,
    domain: Bubbli.Social,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer],
    extensions: [AshJsonApi.Resource]

  json_api do
    type "connection_request"
    includes requester: [:profile], receiver: [:profile]

    routes do
      base "/connection-requests"

      index :list_incoming, route: "/incoming"
      index :list_outgoing, route: "/outgoing"
      get :read
      post :send
      patch :accept, route: "/:id/accept"
      patch :reject, route: "/:id/reject"
      patch :cancel, route: "/:id/cancel"
    end
  end

  postgres do
    table "connection_requests"
    repo Bubbli.Repo

    custom_indexes do
      # At most one *pending* request per direction. Cross-direction duplicates
      # and "already connected" are handled by the NoActiveRequestOrConnection
      # validation, which also guards the common (non-racing) case.
      index [:requester_id, :receiver_id],
        unique: true,
        where: "status = 'pending'",
        name: "connection_requests_unique_pending_index"
    end
  end

  actions do
    defaults [:read]

    read :list_incoming do
      description "List pending requests received by the current user"
      filter expr(status == :pending and receiver_id == ^actor(:id))
    end

    read :list_outgoing do
      description "List pending requests sent by the current user"
      filter expr(status == :pending and requester_id == ^actor(:id))
    end

    create :send do
      description "Send a connection request to another user"
      accept []

      argument :receiver_id, :uuid do
        allow_nil? false
        description "The user to send the request to"
      end

      # Set the requester to the current actor via the relationship
      change relate_actor(:requester)

      # Set the receiver from the argument via the relationship.
      # authorize?: false so we can look up the receiver even if the actor
      # can't normally "see" them (e.g. connections_only profile visibility).
      change manage_relationship(:receiver_id, :receiver,
               type: :append_and_remove,
               authorize?: false
             )

      change set_attribute(:status, :pending)

      validate {Bubbli.Social.ConnectionRequest.Validations.NotSelfRequest, []}

      validate {Bubbli.Social.ConnectionRequest.Validations.NoActiveRequestOrConnection, []}
    end

    update :accept do
      description "Accept a pending request, establishing a mutual connection"
      accept []
      require_atomic? false

      validate attribute_equals(:status, :pending) do
        message "can only accept pending requests"
      end

      change set_attribute(:status, :accepted)
      change {Bubbli.Social.ConnectionRequest.Changes.EstablishConnection, []}
    end

    update :reject do
      description "Reject a pending request"
      accept []

      validate attribute_equals(:status, :pending) do
        message "can only reject pending requests"
      end

      change set_attribute(:status, :rejected)
    end

    update :cancel do
      description "Withdraw a pending request (by the requester)"
      accept []

      validate attribute_equals(:status, :pending) do
        message "can only cancel pending requests"
      end

      change set_attribute(:status, :cancelled)
    end
  end

  policies do
    policy action_type(:read) do
      description "Users can only read requests they are part of"
      authorize_if expr(requester_id == ^actor(:id))
      authorize_if expr(receiver_id == ^actor(:id))
    end

    policy action(:send) do
      description "Any authenticated user can send a request"
      authorize_if actor_present()
    end

    policy action([:accept, :reject]) do
      description "Only the receiver can accept or reject a request"
      authorize_if expr(receiver_id == ^actor(:id))
    end

    policy action(:cancel) do
      description "Only the requester can cancel their request"
      authorize_if expr(requester_id == ^actor(:id))
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :status, :atom do
      allow_nil? false
      default :pending
      public? true
      constraints one_of: [:pending, :accepted, :rejected, :cancelled]
      description "Lifecycle state of the request"
    end

    create_timestamp :inserted_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :requester, Bubbli.Accounts.User do
      allow_nil? false
      public? true
      description "The user who initiated the request"
    end

    belongs_to :receiver, Bubbli.Accounts.User do
      allow_nil? false
      public? true
      description "The user who received the request"
    end
  end
end
