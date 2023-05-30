defmodule PrivateSocial.Conversation.Thread do
  use Ecto.Schema
  import Ecto.Changeset

  schema "threads" do


    timestamps()
  end

  @doc false
  def changeset(thread, attrs) do
    thread
    |> cast(attrs, [])
    |> validate_required([])
  end
end
