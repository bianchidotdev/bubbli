defmodule BubbliWeb.Router do
  use BubbliWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :authed do
    plug BubbliWeb.Plug.Auth
  end

  # routes for authn
  scope "/api/v1", BubbliWeb do
    pipe_through [:api]

    post "/registration/start", RegistrationController, :start
    post "/registration/confirm", RegistrationController, :confirm

    post "/auth/login_start", AuthenticationController, :start
    post "/auth/login_verify", AuthenticationController, :verify

    delete "/auth/logout", AuthenticationController, :logout
  end

  # authenticated routes
  scope "/api/v1", BubbliWeb do
    pipe_through [:api, :authed]
    get "/current_user", UserController, :show
    get "/test", RegistrationController, :test
    # delete "/auth/logout", AuthenticationController, :delete
  end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:bubbli, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through [:fetch_session, :protect_from_forgery]

      live_dashboard "/dashboard", metrics: BubbliWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
