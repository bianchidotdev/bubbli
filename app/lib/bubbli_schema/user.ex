defmodule BubbliSchema.User do
  @moduledoc """
  Schema for the User model
  """
  use Ecto.Schema

  import Ecto.Changeset

  @type t :: %__MODULE__{
          id: binary(),
          email: String.t(),
          is_active: boolean(),
          display_name: String.t(),
          username: String.t(),
          master_public_key: String.t(),
          root_password_hash: String.t(),
          inserted_at: NaiveDateTime.t(),
          updated_at: NaiveDateTime.t(),
          client_keys: [BubbliSchema.ClientKey.t()]
        }

  @primary_key {:id, :binary_id, autogenerate: true}
  # TODO: figure out if this should live in the user view
  # @public_fields [
  #   :email,
  #   :is_active,
  #   :display_name,
  #   :username,
  #   :home_timeline_id
  # ]

  # def serialize_for_api(user) do
  #   user = %{user | home_timeline_id: user.home_timeline.id}
  #   Enum.reduce(Map.from_struct(user), %{}, fn
  #     {_, %Ecto.Association.NotLoaded{}}, acc -> acc
  #     {k, v}, acc when k in @public_fields -> Map.put(acc, k, v)
  #     {_, _}, acc -> acc
  #   end)
  # end

  def verify_user(user, password) do
    Argon2.verify_pass(password, user.root_password_hash)
  end

  schema "users" do
    field(:email, :string)
    field(:is_active, :boolean, default: false)

    # cryptography
    # PEM encoded
    field(:master_public_key, :string)
    field(:root_password_hash, :binary)

    # user attributes
    field(:display_name, :string)
    field(:username, :string)
    field(:home_timeline_id, :binary, virtual: true)

    timestamps()

    has_many(:client_keys, BubbliSchema.ClientKey)
    has_many(:timelines, BubbliSchema.Timeline)
    has_one(:home_timeline, BubbliSchema.Timeline, where: [type: :user])
  end

  @doc false
  def changeset(user, attrs, opts \\ []) do
    user
    |> cast(attrs, [
      :email,
      :is_active,
      :display_name,
      :master_public_key,
      :root_password_hash,
      :username
    ])
    # TODO: cast assoc for client_keys
    |> validate_required([
      :is_active,
      :display_name,
      :username,
      :master_public_key
    ])
    |> validate_email(opts)
    |> validate_root_password_hash(opts)
  end

  defp validate_email(changeset, opts) do
    changeset
    |> validate_required([:email])
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must have the @ sign and no spaces")
    |> validate_length(:email, max: 160)
    |> maybe_validate_unique_email(opts)
  end

  defp validate_root_password_hash(changeset, _opts) do
    changeset
    |> validate_required([:root_password_hash])
    # TODO: validate byte length
    # |> validate_length(:password, min: 12, max: 72)
    |> put_pass_hash()
  end

  defp maybe_validate_unique_email(changeset, opts) do
    if Keyword.get(opts, :validate_email, true) do
      changeset
      |> unsafe_validate_unique(:email, Bubbli.Repo)
      |> unique_constraint(:email)
    else
      changeset
    end
  end

  # this mimics bitwardens server-side password hashing model
  # ref: https://bitwarden.com/images/resources/security-white-paper-download.pdf
  # hashing defaults: https://bitwarden.com/help/kdf-algorithms/#argon2id
  defp put_pass_hash(%Ecto.Changeset{valid?: true, changes: %{root_password_hash: password_hash}} = changeset) do
    # TODO: ensure the right opts are used
    change(changeset, %{root_password_hash: Argon2.hash_pwd_salt(password_hash)})
  end

  defp put_pass_hash(changeset), do: changeset
end
