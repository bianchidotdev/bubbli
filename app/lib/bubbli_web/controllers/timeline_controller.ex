defmodule BubbliWeb.TimelineController do
  use BubbliWeb, :controller

  # import Ecto.Changeset

  require Logger

  action_fallback BubbliWeb.FallbackController

  def home(conn, _params) do
    user = Map.fetch!(conn.assigns, :current_user)
    posts = Bubbli.Posts.get_posts_for_user(user)

    conn
    |> put_status(200)
    |> render(:home, posts: posts)
  end
end
