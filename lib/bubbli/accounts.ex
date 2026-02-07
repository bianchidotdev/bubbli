defmodule Bubbli.Accounts do
  use Ash.Domain,
    otp_app: :bubbli,
    extensions: [AshJsonApi.Domain]

  json_api do
    prefix "/api"
    log_errors? true
  end

  resources do
    resource Bubbli.Accounts.Token
    resource Bubbli.Accounts.User
  end
end
