defmodule Bubbli.Social do
  use Ash.Domain,
    otp_app: :bubbli,
    extensions: [AshJsonApi.Domain]

  json_api do
    prefix "/api"
    log_errors? true
  end

  resources do
    resource Bubbli.Social.Circle
    resource Bubbli.Social.CircleMember
  end
end
