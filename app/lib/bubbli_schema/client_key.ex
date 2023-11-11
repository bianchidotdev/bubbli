defmodule BubbliSchema.ClientKey do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset

  @type t :: %__MODULE__{
          id: binary(),
          type: :password | :recovery | :device,
          # name: String.t(),
          encryption_iv: String.t(),
          encrypted_private_key: String.t(),
          inserted_at: NaiveDateTime.t(),
          updated_at: NaiveDateTime.t(),
          user: BubbliSchema.User.t()
        }

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "client_keys" do
    field(:type, Ecto.Enum, values: [:password, :recovery, :device])
    # field(:name, :string)

    field(:encryption_iv, :string)
    field(:encrypted_private_key, :string, redact: true)

    timestamps()

    belongs_to(:user, BubbliSchema.User, type: :binary_id, primary_key: true)
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:type, :encryption_iv, :encrypted_private_key, :user_id])
    |> validate_required([:type, :encryption_iv, :encrypted_private_key, :user_id])
    |> foreign_key_constraint(:user_id)
  end
end
