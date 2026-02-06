defmodule Bubbli.Secrets do
  use AshAuthentication.Secret

  def secret_for(
        [:authentication, :tokens, :signing_secret],
        Bubbli.Accounts.User,
        _opts,
        _context
      ) do
    Application.fetch_env(:bubbli, :token_signing_secret)
  end
end
