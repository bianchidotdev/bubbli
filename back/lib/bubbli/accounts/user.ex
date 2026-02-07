defmodule Bubbli.Accounts.User do
  use Ash.Resource,
    otp_app: :bubbli,
    domain: Bubbli.Accounts,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer],
    extensions: [AshAuthentication, AshJsonApi.Resource]

  authentication do
    add_ons do
      log_out_everywhere do
        apply_on_password_change? true
      end
    end

    tokens do
      enabled? true
      token_resource Bubbli.Accounts.Token
      signing_secret Bubbli.Secrets
      store_all_tokens? true
      require_token_presence_for_authentication? true
    end

    strategies do
      magic_link do
        identity_field :email
        registration_enabled? true
        require_interaction? true

        sender Bubbli.Accounts.User.Senders.SendMagicLinkEmail
      end

      remember_me :remember_me
    end
  end

  json_api do
    type "user"

    routes do
      base "/users"

      get :read

      patch :update_profile, route: "/:id/profile"
    end
  end

  postgres do
    table "users"
    repo Bubbli.Repo
  end

  actions do
    defaults [:read]

    read :get_by_subject do
      description "Get a user by the subject claim in a JWT"
      argument :subject, :string, allow_nil?: false
      get? true
      prepare AshAuthentication.Preparations.FilterBySubject
    end

    read :get_by_email do
      description "Looks up a user by their email"
      get_by :email
    end

    create :sign_in_with_magic_link do
      description "Sign in or register a user with magic link."

      argument :token, :string do
        description "The token from the magic link that was sent to the user"
        allow_nil? false
      end

      argument :remember_me, :boolean do
        description "Whether to generate a remember me token"
        allow_nil? true
      end

      upsert? true
      upsert_identity :unique_email
      upsert_fields [:email]

      # Uses the information from the token to create or sign in the user
      change AshAuthentication.Strategy.MagicLink.SignInChange

      change {AshAuthentication.Strategy.RememberMe.MaybeGenerateTokenChange,
              strategy_name: :remember_me}

      metadata :token, :string do
        allow_nil? false
      end
    end

    action :request_magic_link do
      argument :email, :ci_string do
        allow_nil? false
      end

      run AshAuthentication.Strategy.MagicLink.Request
    end

    update :update_profile do
      description "Update user profile fields"
      accept [:display_name, :handle, :bio, :avatar_url, :profile_visibility, :comment_visibility]
    end
  end

  policies do
    bypass AshAuthentication.Checks.AshAuthenticationInteraction do
      authorize_if always()
    end

    policy action(:request_magic_link) do
      authorize_if always()
    end

    policy action(:sign_in_with_magic_link) do
      authorize_if always()
    end

    policy action_type(:read) do
      # Can always read yourself
      authorize_if expr(id == ^actor(:id))
      # Can read anyone with a public profile
      authorize_if expr(profile_visibility == :public)
      # Can read users you've added to one of your circles
      authorize_if expr(exists(circle_memberships, circle.owner_id == ^actor(:id)))
      # Can read users who've added you to one of their circles
      authorize_if expr(exists(owned_circles.members, user_id == ^actor(:id)))
    end

    policy action(:update_profile) do
      authorize_if expr(id == ^actor(:id))
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :email, :ci_string do
      allow_nil? false
      public? true
    end

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

    attribute :profile_visibility, :atom do
      constraints one_of: [:connections_only, :public]
      default :connections_only
      allow_nil? false
    end

    attribute :comment_visibility, :atom do
      constraints one_of: [:connections_and_group_members, :everyone_on_post]
      default :connections_and_group_members
      allow_nil? false
    end

    create_timestamp :inserted_at
    update_timestamp :updated_at
  end

  relationships do
    has_many :owned_circles, Bubbli.Social.Circle do
      source_attribute :id
      destination_attribute :owner_id
    end

    has_many :circle_memberships, Bubbli.Social.CircleMember do
      source_attribute :id
      destination_attribute :user_id
    end
  end

  calculations do
    calculate :system_circles,
              {:array, :struct},
              Bubbli.Accounts.User.Calculations.SystemCircles do
      description "Virtual system circles defined in code, not the database"
      public? true
    end
  end

  identities do
    identity :unique_email, [:email]
    identity :unique_handle, [:handle]
  end
end
