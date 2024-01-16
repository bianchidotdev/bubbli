defmodule BubbliWeb.Router do
  use BubbliWeb, :router

  pipeline :api do
    plug(:accepts, ["json"])
  end

  pipeline :authed do
    plug(BubbliWeb.Plug.Auth)
  end

  # routes for authn
  scope "/api/v1", BubbliWeb do
    pipe_through([:api])

    post("/auth/register", RegistrationController, :register)

    post("/auth/login", AuthenticationController, :login)
    delete("/auth/logout", AuthenticationController, :logout)
  end

  # authenticated routes
  scope "/api/v1", BubbliWeb do
    pipe_through([:api, :authed])
    get("/current_user", UserController, :current_user)
    get("/test", RegistrationController, :test)
    # delete "/auth/logout", AuthenticationController, :delete
    # get("/dashboard", DashboardController, :show)

    get("/timelines/home", TimelineController, :home)

    scope "/timelines/:timeline_id" do
      resources("/posts", PostController, only: [:index, :show, :create, :update, :delete])
    end
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
      pipe_through([:fetch_session, :protect_from_forgery])

      live_dashboard("/dashboard", metrics: BubbliWeb.Telemetry)
      forward("/mailbox", Plug.Swoosh.MailboxPreview)
    end
  end
end
