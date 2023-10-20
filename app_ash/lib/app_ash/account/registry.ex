defmodule AppAsh.Account.Registry do
  use Ash.Registry,
    extensions: [
      # This extension adds helpful compile time validations
      Ash.Registry.ResourceValidations
    ]

  entries do
    entry AppAsh.Account.User
    entry AppAsh.Account.ClientKey
    entry AppAsh.Account.Token
  end
end
