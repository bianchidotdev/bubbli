defmodule BubbliWeb.Router do
  use BubbliWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", BubbliWeb do
    pipe_through :api
  end

  # Enable Swoosh mailbox preview in development
  if Application.compile_env(:bubbli, :dev_routes) do

    scope "/dev" do
      pipe_through [:fetch_session, :protect_from_forgery]

      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
