defmodule BubbliWeb.Router do
  use BubbliWeb, :router

  import AshAuthentication.Plug.Helpers

  pipeline :api do
    plug :accepts, ["json"]
    plug :load_from_bearer
  end

  scope "/api" do
    pipe_through [:api]

    # Auth routes — must be before the catch-all AshJsonApi forward
    scope "/auth", BubbliWeb do
      post "/magic-link/request", AuthController, :request_magic_link
      post "/magic-link/callback", AuthController, :callback
      get "/me", AuthController, :me
      post "/sign-out", AuthController, :sign_out
    end

    forward "/swaggerui", OpenApiSpex.Plug.SwaggerUI,
      path: "/api/open_api",
      default_model_expand_depth: 4

    forward "/", BubbliWeb.AshJsonApiRouter
  end

  # Enable Swoosh mailbox preview in development
  if Application.compile_env(:bubbli, :dev_routes) do
    scope "/dev" do
      pipe_through [:fetch_session, :protect_from_forgery]

      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end

  defp load_from_bearer(conn, _opts) do
    retrieve_from_bearer(conn, :bubbli)
  end
end
