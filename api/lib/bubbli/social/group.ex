defmodule Bubbli.Social.Group do
  use Ash.Resource,
    otp_app: :bubbli,
    domain: Bubbli.Social,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer],
    extensions: [AshJsonApi.Resource]

  json_api do
    type "group"
    includes [:owner]

    routes do
      base "/groups"

      index :list
      get :read
      post :create
      patch :update
      delete :destroy
    end
  end

  postgres do
    table "groups"
    repo Bubbli.Repo
  end

  actions do
    defaults [:read]

    read :list do
      description "List groups visible to the current user"

      filter expr(
               privacy == :public or
                 owner_id == ^actor(:id) or
                 exists(members, user_id == ^actor(:id))
             )
    end

    create :create do
      description "Create a new group"
      accept [:name, :description, :cover_image_url, :privacy]
      change relate_actor(:owner)
      change {Bubbli.Social.Group.Changes.AddOwnerAsAdmin, []}
    end

    update :update do
      description "Update group details"
      accept [:name, :description, :cover_image_url, :privacy]
    end

    destroy :destroy do
      description "Delete a group"
    end
  end

  policies do
    policy action(:create) do
      description "Any authenticated user can create a group"
      authorize_if actor_present()
    end

    policy action(:list) do
      description "Any authenticated user can list groups"
      authorize_if actor_present()
    end

    policy action_type(:read) do
      description "Users can read public groups or groups they belong to"
      authorize_if expr(privacy == :public)
      authorize_if expr(owner_id == ^actor(:id))
      authorize_if expr(exists(members, user_id == ^actor(:id)))
    end

    policy action(:update) do
      description "Only the owner or admins can update a group"
      authorize_if expr(owner_id == ^actor(:id))
      authorize_if expr(exists(members, user_id == ^actor(:id) and role == :admin))
    end

    policy action(:destroy) do
      description "Only the owner can delete a group"
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

    attribute :description, :string do
      public? true
      constraints max_length: 1000
    end

    attribute :cover_image_url, :string do
      public? true
    end

    attribute :privacy, :atom do
      allow_nil? false
      default :public
      public? true
      constraints one_of: [:public, :private]
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
      public? true
    end

    has_many :members, Bubbli.Social.GroupMember
  end
end
