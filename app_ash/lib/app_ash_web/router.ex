defmodule AppAshWeb.Router do
  use AppAshWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {AppAshWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :authed do
    plug(AppAshWeb.Plug.Auth)
  end

  # scope "/", AppAshWeb do
  #   pipe_through :browser

  #   get "/", PageController, :home
  # end

  scope "/api/v1", AppAshWeb do
    pipe_through([:api])

    # post("/registration/start", RegistrationController, :start)
    post("/register", RegistrationController, :register)

    post("/auth/signin", AuthenticationController, :signin)
    post("/auth/login_start", AuthenticationController, :start)
    post("/auth/login_verify", AuthenticationController, :verify)

    delete("/auth/logout", AuthenticationController, :logout)
  end

  # authenticated routes
  scope "/api/v1", AppAshWeb do
    pipe_through([:api, :authed])
    get("/current_user", UserController, :show)
    get("/test", RegistrationController, :test)
    # delete "/auth/logout", AuthenticationController, :delete
  end

  # Other scopes may use custom stacks.
  # scope "/api", AppAshWeb do
  #   pipe_through :api
  # end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:app_ash, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: AppAshWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
