defmodule BubbliWeb.TimelineKeySchema do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset

  alias BubbliWeb.Base64EncodedBinary

  embedded_schema do
    field :key_algorithm, :map
    field :wrap_algorithm, :map
    field :key_usages, {:array, :string}
    field :protected_encryption_key, Base64EncodedBinary
  end

  def changeset(timeline_key, params \\ %{}) do
    timeline_key
    |> cast(params, [:key_algorithm, :wrap_algorithm, :key_usages, :protected_encryption_key])
    |> validate_required([:key_algorithm, :wrap_algorithm, :key_usages, :protected_encryption_key])
  end
end
