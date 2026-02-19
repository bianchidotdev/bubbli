defmodule Bubbli.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    # OpentelemetryPhoenix.setup(adapter: :bandit)
    # OpentelemetryEcto.setup([:bubbli, :repo])

    children = [
      BubbliWeb.Telemetry,
      Bubbli.Repo,
      {DNSCluster, query: Application.get_env(:bubbli, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: Bubbli.PubSub},
      # Start a worker by calling: Bubbli.Worker.start_link(arg)
      # {Bubbli.Worker, arg},
      # Start to serve requests, typically the last entry
      BubbliWeb.Endpoint,
      {AshAuthentication.Supervisor, [otp_app: :bubbli]}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Bubbli.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    BubbliWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
