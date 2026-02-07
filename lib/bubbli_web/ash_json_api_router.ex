defmodule BubbliWeb.AshJsonApiRouter do
  use AshJsonApi.Router,
    domains: [Bubbli.Accounts, Bubbli.Social],
    open_api: "/open_api"
end
