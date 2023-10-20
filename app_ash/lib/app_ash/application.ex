defmodule AppAsh.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      AppAshWeb.Telemetry,
      AppAsh.Repo,
      {DNSCluster, query: Application.get_env(:app_ash, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: AppAsh.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: AppAsh.Finch},
      # Start a worker by calling: AppAsh.Worker.start_link(arg)
      # {AppAsh.Worker, arg},
      # Start to serve requests, typically the last entry
      AppAshWeb.Endpoint,
      {AshAuthentication.Supervisor, otp_app: :app_ash}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: AppAsh.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    AppAshWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
