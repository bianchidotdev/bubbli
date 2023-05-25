defmodule PrivateSocial.Account.User do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}

  schema "users" do
    field :email, :string
    field :is_active, :boolean, default: false

    # cryptography
    field :encrypted_master_private_key
    field :master_public_key, :string
    field :salt, :string

    # user attributes
    field :display_name, :string
    field :first_name, :string
    field :last_name, :string

    timestamps()

    has_many :client_keys, PrivateSocial.Account.ClientKey
    has_many :authentication_challenges, PrivateSocial.Account.AuthenticationChallenge
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :is_active])
    |> validate_required([:email, :is_active])
    |> unique_constraint(:email)
  end
end
