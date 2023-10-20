defmodule AppAsh.Account.Token do
  use Ash.Resource,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshAuthentication.TokenResource]

  token do
    api AppAsh.Account
  end

  postgres do
    table "tokens"
    repo AppAsh.Repo
  end
end
