defmodule BubbliWeb.PageController do
  use BubbliWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
