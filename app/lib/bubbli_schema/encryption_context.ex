defmodule BubbliSchema.EncryptionContext do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset

  @type t :: %__MODULE__{
          id: binary(),
          inserted_at: NaiveDateTime.t(),
          updated_at: NaiveDateTime.t()
        }

  @primary_key {:id, :binary_id, autogenerate: true}

  schema "encryption_contexts" do
    belongs_to(:timeline, BubbliSchema.Timeline, type: :binary_id, primary_key: true)
    has_many(:encryption_keys, BubbliSchema.EncryptionKey, on_delete: :delete_all)

    timestamps()
  end

  def changeset(encryption_context, attrs) do
    encryption_context
    |> cast(attrs, [:reference_id, :reference_type, :encrypted_encryption_key])
    |> validate_required([:reference_id, :reference_type, :encrypted_encryption_key])
  end
end
