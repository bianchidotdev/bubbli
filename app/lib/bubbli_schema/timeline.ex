defmodule BubbliSchema.Timeline do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset

  @type t :: %__MODULE__{
          id: binary(),
          type: Enum.t(),
          user_id: binary(),
          # group_id: binary(),
          encryption_context: BubbliSchema.EncryptionContext.t(),
          inserted_at: NaiveDateTime.t(),
          updated_at: NaiveDateTime.t()
        }

  @primary_key {:id, :binary_id, autogenerate: true}

  schema "timelines" do
    field(:type, Ecto.Enum, values: [:user, :group])
    belongs_to(:user, BubbliSchema.User, type: :binary_id, primary_key: true, foreign_key: :user_id)
    # belongs_to(:group, BubbliSchema.Group, type: :binary_id, primary_key: true, foreign_key: :group_id)

    has_one(:encryption_context, BubbliSchema.EncryptionContext, on_delete: :delete_all)

    timestamps()
  end

  def changeset(timeline, attrs) do
    timeline
    # , :group_id])
    |> cast(attrs, [:type, :user_id])
    |> validate_required([:type])

    # TODO: validate that only one of user_id or group_id is present
    # TODO: validate one of user_id or group_id is present
  end
end
