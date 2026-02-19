defmodule Bubbli.Accounts.Profile do
  use Ash.Resource,
    otp_app: :bubbli,
    domain: Bubbli.Accounts,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer],
    extensions: [AshJsonApi.Resource]

  json_api do
    type "profile"

    routes do
      base "/profiles"

      get :read
      patch :update_profile
    end
  end

  postgres do
    table "profiles"
    repo Bubbli.Repo
  end

  actions do
    defaults [:read]

    create :create do
      description "Create a profile for a user"
      accept [:display_name, :handle, :bio, :avatar_url, :location]
      argument :user_id, :uuid, allow_nil?: false
      change manage_relationship(:user_id, :user, type: :append_and_remove)
    end

    update :update_profile do
      description "Update profile fields (supports partial updates for inline editing)"

      accept [
        :display_name,
        :handle,
        :bio,
        :avatar_url,
        :location,
        :profile_visibility,
        :comment_visibility
      ]
    end
  end

  policies do
    bypass AshAuthentication.Checks.AshAuthenticationInteraction do
      authorize_if always()
    end

    policy action_type(:read) do
      # Can always read your own profile
      authorize_if expr(user_id == ^actor(:id))
      # Can read public profiles
      authorize_if expr(profile_visibility == :public)
      # Can read profiles of users you've added to one of your circles
      authorize_if expr(exists(user.circle_memberships, circle.owner_id == ^actor(:id)))
      # Can read profiles of users who've added you to one of their circles
      authorize_if expr(exists(user.owned_circles.members, user_id == ^actor(:id)))
    end

    policy action(:create) do
      authorize_if always()
    end

    policy action(:update_profile) do
      authorize_if expr(user_id == ^actor(:id))
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :display_name, :string do
      public? true
      constraints max_length: 100
    end

    attribute :handle, :string do
      public? true
      constraints max_length: 40, match: ~r/\A[a-zA-Z0-9_]+\z/
    end

    attribute :bio, :string do
      public? true
      constraints max_length: 500
    end

    attribute :avatar_url, :string do
      public? true
    end

    attribute :location, :string do
      public? true
      constraints max_length: 100
    end

    attribute :profile_visibility, :atom do
      constraints one_of: [:connections_only, :public]
      default :connections_only
      allow_nil? false
      public? true
    end

    attribute :comment_visibility, :atom do
      constraints one_of: [:connections_and_group_members, :everyone_on_post]
      default :connections_and_group_members
      allow_nil? false
      public? true
    end

    create_timestamp :inserted_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :user, Bubbli.Accounts.User do
      allow_nil? false
      public? true
    end
  end

  identities do
    identity :unique_user, [:user_id]
    identity :unique_handle, [:handle]
  end
end
