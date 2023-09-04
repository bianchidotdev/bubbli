defmodule Bubbli.Account.User do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @public_fields [
    :email,
    :is_active,
    :display_name,
    :salt
  ]

  # https://bitwarden.com/help/kdf-algorithms/#argon2id
  @argon2_opts [
    t_cost: 3,
    # 64 MiB
    m_cost: 16,
    parallelism: 4
  ]

  def serialize_for_api(user) do
    Enum.reduce(Map.from_struct(user), %{}, fn
      {_, %Ecto.Association.NotLoaded{}}, acc -> acc
      {k, v}, acc when k in @public_fields -> Map.put(acc, k, v)
      {_, _}, acc -> acc
    end)
  end

  def verify_user(user, password) do
    Argon2.verify_pass(password, user.master_password_hash)
  end

  schema "users" do
    field(:email, :string)
    field(:is_active, :boolean, default: false)

    # cryptography
    # field(:encrypted_master_private_keys, :map, redact: true)
    field(:master_public_key, :string)
    field(:salt, :string)
    field(:master_password_hash, :string)

    # user attributes
    field(:display_name, :string)
    field(:username, :string)

    timestamps()

    has_many(:client_keys, Bubbli.Account.ClientKey)

    has_many(:authentication_challenges, Bubbli.Account.AuthenticationChallenge,
      references: :email,
      foreign_key: :email
    )
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [
      :email,
      :is_active,
      :display_name,
      :master_public_key,
      # :encrypted_master_private_keys,
      :salt,
      :master_password_hash,
      :username
    ])
    |> validate_required([
      :email,
      :is_active,
      :display_name,
      # :username,
      :master_public_key,
      # :encrypted_master_private_keys,
      :salt,
      :master_password_hash
    ])
    |> validate_format(:email, ~r/@/)
    |> unique_constraint(:email)
    |> put_pass_hash()
  end

  # this mimics bitwardens server-side password hashing model
  # ref: https://bitwarden.com/images/resources/security-white-paper-download.pdf
  # hashing defaults: https://bitwarden.com/help/kdf-algorithms/#argon2id
  defp put_pass_hash(
         %Ecto.Changeset{
           valid?: true,
           changes: %{master_password_hash: password_hash, salt: salt}
         } = changeset
       ) do
    hashed_password_hash =
      Argon2.Base.hash_password(password_hash, salt, @argon2_opts)

    change(changeset, %{master_password_hash: hashed_password_hash})
  end

  defp put_pass_hash(changeset), do: changeset
end
