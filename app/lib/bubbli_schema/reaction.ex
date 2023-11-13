defmodule BubbliSchema.Reaction do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset

  schema "reactions" do
    field :reactable_id, :id
    field :reactable_type, :string

    timestamps()
  end

  def changeset(reaction, attrs) do
    reaction
    |> cast(attrs, [:reactable_id, :reactable_type])
    |> validate_required([:reactable_id, :reactable_type])
  end
end
