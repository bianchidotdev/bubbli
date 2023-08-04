defmodule Bubbli.Account.User do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}

  schema "users" do
    field :email, :string
    field :is_active, :boolean, default: false

    # cryptography
    field :encrypted_master_private_key, :map, redact: true
    field :master_public_key, :string
    field :salt, :string

    # user attributes
    field :display_name, :string
    field :first_name, :string
    field :last_name, :string

    timestamps()

    has_many :client_keys, Bubbli.Account.ClientKey

    has_many :authentication_challenges, Bubbli.Account.AuthenticationChallenge,
      references: :email,
      foreign_key: :email
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [
      :email,
      :is_active,
      :encrypted_master_private_key,
      :master_public_key,
      :display_name,
      :first_name,
      :last_name
    ])
    |> validate_required([:email, :is_active])
    # Check that email is valid
    |> validate_format(:email, ~r/@/)
    |> unique_constraint(:email)
  end
end
