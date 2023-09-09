defmodule BubbliWeb.UserController do
  use BubbliWeb, :controller

  require Logger

  action_fallback BubbliWeb.FallbackController

  def show(conn, _) do
    with {:ok, user} <- Map.fetch(conn.assigns, :current_user) do
      conn |> put_status(200) |> render(:user, user: user)
    else
      _ ->
        conn |> put_status(200) |> render(:user, user: nil)
    end
  end
end
