defmodule BubbliWeb.ClientKeySchema do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset

  alias BubbliWeb.Base64EncodedBinary

  embedded_schema do
    field :key_algorithm, :map
    field :wrap_algorithm, :map
    field :key_usages, {:array, :string}
    field :protected_private_key, Base64EncodedBinary
    field :type, :string
  end

  def changeset(client_key, attrs \\ %{}) do
    client_key
    |> cast(attrs, [:key_algorithm, :wrap_algorithm, :key_usages, :protected_private_key, :type])
    |> validate_required([:key_algorithm, :wrap_algorithm, :key_usages, :protected_private_key, :type])
  end
end
