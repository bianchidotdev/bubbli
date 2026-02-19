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
    includes [:profile]

    routes do
      base "/users"

      get :read
      index :search, route: "/search"
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

      # Ensure a profile record exists for the user after sign-in/registration
      change Bubbli.Accounts.User.Changes.EnsureProfile

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

    read :search do
      description "Search for users by handle or display name"

      argument :query, :string do
        allow_nil? false
        constraints min_length: 1, max_length: 100
      end

      prepare Bubbli.Accounts.User.Preparations.Search

      prepare build(sort: [email: :asc])
    end
  end

  policies do
    bypass AshAuthentication.Checks.AshAuthenticationInteraction do
      authorize_if always()
    end

    bypass action(:search) do
      description "Any authenticated user can search for other users"
      authorize_if actor_present()
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
      authorize_if expr(exists(profile, profile_visibility == :public))
      # Can read users you've added to one of your circles
      authorize_if expr(exists(circle_memberships, circle.owner_id == ^actor(:id)))
      # Can read users who've added you to one of their circles
      authorize_if expr(exists(owned_circles.members, user_id == ^actor(:id)))
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :email, :ci_string do
      allow_nil? false
      public? true
    end

    create_timestamp :inserted_at
    update_timestamp :updated_at
  end

  relationships do
    has_one :profile, Bubbli.Accounts.Profile do
      source_attribute :id
      destination_attribute :user_id
      public? true
    end

    has_many :owned_circles, Bubbli.Social.Circle do
      source_attribute :id
      destination_attribute :owner_id
    end

    has_many :circle_memberships, Bubbli.Social.CircleMember do
      source_attribute :id
      destination_attribute :user_id
    end

    has_many :sent_connections, Bubbli.Social.Connection do
      source_attribute :id
      destination_attribute :requester_id
    end

    has_many :received_connections, Bubbli.Social.Connection do
      source_attribute :id
      destination_attribute :receiver_id
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
  end
end
