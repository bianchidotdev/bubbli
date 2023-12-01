defmodule BubbliSchema.EncryptionContext do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset

  @required_attrs [
    :timeline_id
  ]
  @optional_attrs []
  @attrs @required_attrs ++ @optional_attrs

  @type t :: %__MODULE__{
          id: binary(),
          timeline: BubbliSchema.Timeline.t(),
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
    |> cast(attrs, @attrs)
    |> validate_required(@required_attrs)
  end
end
