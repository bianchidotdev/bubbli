defmodule Bubbli.Accounts do
  use Ash.Domain,
    otp_app: :bubbli

  resources do
    resource Bubbli.Accounts.Token
    resource Bubbli.Accounts.User
  end
end
