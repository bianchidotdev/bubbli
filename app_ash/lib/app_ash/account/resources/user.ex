defmodule AppAsh.Account.User do
  use Ash.Resource,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshAuthentication, ]


  postgres do
    table "users"
    repo AppAsh.Repo
  end

  authentication do
    api AppAsh.Account

    strategies do
      password :password do
        identity_field :email
        sign_in_tokens_enabled? true
        hashed_password_field :master_password_hash
        hash_provider AppAsh.Argon2Provider
      end
    end

    tokens do
      enabled? true
      token_resource AppAsh.Account.Token

      signing_secret AppAsh.Account.Secrets
    end
  end

  code_interface do
    define_for AppAsh.Account
    define :register, action: :create
    # define :create, action: :create
    define :read_all, action: :read
    define :update, action: :update
    define :destroy, action: :destroy
    define :get_by_id, args: [:id], action: :by_id
    define :get_by_email, args: [:email], action: :by_email
  end

  actions do
    # Exposes default built in actions to manage the resource
    defaults [:create, :read, :update, :destroy]

    create :register do
      accept [
        :email,
        :display_name,
        :username,
        :master_public_key,
        # :client_keys,
        # :encd_user_enc_key,
        :master_password_hash
      ]

      argument :client_keys, {:array, :map} do
        allow_nil? false
      end

      change manage_relationship(
        :client_keys,
        :client_keys,
        type: :create
      )
    end

    # Defines custom read action which fetches post by id.
    read :by_id do
      # This action has one argument :id of type :uuid
      argument :id, :uuid, allow_nil?: false
      # Tells us we expect this action to return a single result
      get? true
      # Filters the `:id` given in the argument
      # against the `id` of each element in the resource
      filter expr(id == ^arg(:id))
    end

    read :by_email do
      argument :email, :string, allow_nil?: false
      get? true
      filter expr(email == ^arg(:email))
    end
  end

  # Attributes are simple pieces of data that exist in your resource
  attributes do
    uuid_primary_key :id

    attribute :email, :ci_string do
      allow_nil? false
    end

    attribute :is_active, :boolean do
      allow_nil? false
      default false
    end

    attribute :master_public_key, :string, allow_nil?: false
    # attribute :salt, :string#, allow_nil?: false
    attribute :master_password_hash, :string, allow_nil?: false, sensitive?: true

    attribute :display_name, :string, allow_nil?: false
    attribute :username, :string, allow_nil?: false
  end

  identities do
    identity :unique_email, [:email]
  end

  relationships do
    has_many(:client_keys, AppAsh.Account.ClientKey)
  end
end
