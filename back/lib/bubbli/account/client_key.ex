defmodule Bubbli.Account.ClientKey do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "client_keys" do
    field(:type, Ecto.Enum, values: [:password, :recovery, :device])
    # field(:name, :string)

    field(:encryption_iv, :string)
    field(:encrypted_private_key, :string, redact: true)

    timestamps()

    belongs_to(:user, Bubbli.Account.User, type: :binary_id, primary_key: true)
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:type, :encryption_iv, :encrypted_private_key, :user_id])
    |> validate_required([:type, :encryption_iv, :encrypted_private_key, :user_id])
    |> foreign_key_constraint(:user_id)
  end
end
