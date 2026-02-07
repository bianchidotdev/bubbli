defmodule BubbliWeb.AshJsonApiRouter do
  use AshJsonApi.Router,
    domains: [Bubbli.Accounts],
    open_api: "/open_api"
end
