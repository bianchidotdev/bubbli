defmodule PrivateSocial.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start the Telemetry supervisor
      PrivateSocialWeb.Telemetry,
      # Start the Ecto repository
      PrivateSocial.Repo,
      # Start the PubSub system
      {Phoenix.PubSub, name: PrivateSocial.PubSub},
      # Start Finch
      {Finch, name: PrivateSocial.Finch},
      # Start the Endpoint (http/https)
      PrivateSocialWeb.Endpoint
      # Start a worker by calling: PrivateSocial.Worker.start_link(arg)
      # {PrivateSocial.Worker, arg}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: PrivateSocial.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    PrivateSocialWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
