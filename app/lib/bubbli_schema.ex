defmodule BubbliSchema do
  @moduledoc """
  Top level schema module
  """
  use Boundary, deps: [Ecto, Ecto.Changeset, Ecto.Query], exports: [User, ClientKey]
end
