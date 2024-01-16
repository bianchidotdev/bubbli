defmodule BubbliWeb.UserController do
  use BubbliWeb, :controller

  require Logger

  action_fallback BubbliWeb.FallbackController

  def current_user(conn, _) do
    case Map.fetch(conn.assigns, :current_user) do
      {:ok, user} ->
        conn |> put_status(200) |> render(:user, user: user)

      _ ->
        conn |> put_status(200) |> render(:user, user: nil)
    end
  end
end
