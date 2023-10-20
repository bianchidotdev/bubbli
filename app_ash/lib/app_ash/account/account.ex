defmodule AppAsh.Account do
  use Ash.Api

  resources do
    registry AppAsh.Account.Registry
  end
end
