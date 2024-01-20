defmodule BubbliSchema.ClientKey do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset

  @required_attrs [
    :type,
    :user_id,
    :protected_private_key,
    :key_algorithm,
    :wrap_algorithm,
    :key_usages
  ]
  @optional_attrs []
  @attrs @required_attrs ++ @optional_attrs

  @type t :: %__MODULE__{
          id: binary(),
          type: :password | :recovery | :device,
          # name: String.t(),
          key_algorithm: map(),
          wrap_algorithm: map(),
          key_usages: list(String.t()),
          protected_private_key: String.t(),
          inserted_at: NaiveDateTime.t(),
          updated_at: NaiveDateTime.t(),
          user: BubbliSchema.User.t()
        }

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "client_keys" do
    field(:type, Ecto.Enum, values: [:password, :recovery, :device])
    # field(:name, :string)

    field(:key_algorithm, :map)
    field(:wrap_algorithm, :map)
    field(:key_usages, {:array, :string})
    field(:protected_private_key, :string, redact: true)

    timestamps()

    belongs_to(:user, BubbliSchema.User, type: :binary_id, primary_key: true)
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, @attrs)
    |> validate_required(@required_attrs)
    |> foreign_key_constraint(:user_id)
  end
end
