defmodule BubbliSchema do
  @moduledoc """
  Top level schema module
  """
  use Boundary,
    deps: [
      Ecto,
      Ecto.Changeset,
      Ecto.Schema,
      Ecto.Query
    ],
    exports: [
      ClientKey,
      EncryptionContext,
      EncryptionKey,
      Post,
      Timeline,
      User,
      UserToken
    ]
end
