defmodule Bubbli.Social.Circle do
  use Ash.Resource,
    otp_app: :bubbli,
    domain: Bubbli.Social,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer],
    extensions: [AshJsonApi.Resource]

  json_api do
    type "circle"

    routes do
      base "/circles"

      index :read
      get :read
      post :create_custom
      patch :update
      delete :destroy
    end
  end

  postgres do
    table "circles"
    repo Bubbli.Repo
  end

  actions do
    defaults [:read]

    create :create_custom do
      description "Create a custom circle"
      accept [:name, :description]

      change fn changeset, context ->
        case context.actor do
          %{id: owner_id} ->
            changeset
            |> Ash.Changeset.force_change_attribute(:owner_id, owner_id)
            |> Ash.Changeset.force_change_attribute(:type, :custom)

          _ ->
            Ash.Changeset.add_error(changeset, field: :owner_id, message: "must be authenticated")
        end
      end
    end

    update :update do
      description "Update a custom circle (name, description)"
      accept [:name, :description]
    end

    destroy :destroy do
      description "Delete a custom circle"
    end
  end

  policies do
    policy action(:create_custom) do
      description "Authenticated users can create custom circles"
      authorize_if actor_present()
    end

    policy action_type(:read) do
      description "Users can read their own circles"
      authorize_if always()
    end

    policy action(:update) do
      description "Only the owner can update their circles"
      authorize_if expr(owner_id == ^actor(:id))
    end

    policy action(:destroy) do
      description "Only the owner can delete their circles"
      authorize_if expr(owner_id == ^actor(:id))
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :name, :string do
      allow_nil? false
      public? true
      constraints max_length: 100
    end

    attribute :type, :atom do
      allow_nil? false
      default :custom
      constraints one_of: [:system, :custom]
    end

    attribute :system_type, :atom do
      constraints one_of: [:private, :all_friends, :public]
      public? true
      description "Deprecated: system circles are now virtual. Kept for backwards compatibility."
    end

    attribute :description, :string do
      public? true
      constraints max_length: 500
    end

    attribute :owner_id, :uuid do
      allow_nil? false
    end

    create_timestamp :inserted_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :owner, Bubbli.Accounts.User do
      allow_nil? false
      attribute_writable? true
      define_attribute? false
      source_attribute :owner_id
    end

    has_many :members, Bubbli.Social.CircleMember
  end
end
