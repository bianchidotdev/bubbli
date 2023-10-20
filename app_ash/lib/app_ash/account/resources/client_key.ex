defmodule AppAsh.Account.ClientKey do
  use Ash.Resource,
    data_layer: AshPostgres.DataLayer

  postgres do
    table "client_keys"
    repo AppAsh.Repo
  end

  code_interface do
    define_for AppAsh.Account
    define :create, action: :create
    define :read_all, action: :read
    define :update, action: :update
    define :destroy, action: :destroy
    define :get_by_id, args: [:id], action: :by_id
  end

  actions do
    # Exposes default built in actions to manage the resource
    defaults [:create, :read, :update, :destroy]

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
  end

  # Attributes are simple pieces of data that exist in your resource
  attributes do
    uuid_primary_key :id

    attribute :type, :atom do
      constraints one_of: [:password, :recovery, :device]
      allow_nil? false
    end

    attribute :encryption_iv, :string do
      allow_nil? false
    end

    attribute :encrypted_private_key, :string do
      sensitive? true
      allow_nil? false
    end
  end

  relationships do
    belongs_to(:user, AppAsh.Account.User) do
      allow_nil? false
    end
  end
end
