defmodule BubbliSchema.EncryptionKey do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset

  @required_attrs [
    :encryption_iv,
    :user_id,
    :encryption_context_id,
    :protected_encryption_key
  ]
  @optional_attrs []
  @attrs @required_attrs ++ @optional_attrs

  @type t :: %__MODULE__{
          id: binary(),
          encryption_iv: binary(),
          protected_encryption_key: binary(),
          user_id: binary(),
          encryption_context_id: binary(),
          inserted_at: NaiveDateTime.t(),
          updated_at: NaiveDateTime.t()
        }

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "encryption_keys" do
    field(:encryption_iv, :binary)
    field(:protected_encryption_key, :binary)

    belongs_to(:encryption_context, BubbliSchema.EncryptionContext, type: :binary_id, primary_key: true)
    belongs_to(:user, BubbliSchema.User, type: :binary_id, primary_key: true)

    timestamps()
  end

  def changeset(encryption_key, attrs) do
    encryption_key
    |> cast(attrs, @attrs)
    |> validate_required(@required_attrs)
  end
end
