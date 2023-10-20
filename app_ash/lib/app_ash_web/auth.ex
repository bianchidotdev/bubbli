defmodule AppAshWeb.Plug.Auth do
  @moduledoc false
  import Plug.Conn

  require Logger

  def init(opts) do
    opts
  end

  def call(conn, _opts) do
    with {:ok, token} <- get_auth_token(conn),
         {:ok, data} <- AppAshWeb.Token.verify(token) do
      assign(conn, :current_user, AppAsh.Account.get_user(data.user_id))
    else
      {:error, error} ->
        Logger.info("Error authenticating request, #{error}")

        conn
        |> put_status(:unauthorized)
        |> Phoenix.Controller.put_view(AppAshWeb.ErrorJSON)
        |> Phoenix.Controller.render(:"401")
        |> halt()
    end
  end

  def get_auth_token(conn) do
    with ["Bearer " <> token] <- get_req_header(conn, "authorization") do
      {:ok, token}
    else
      _ ->
        with {:ok, token} <- Map.fetch(conn.req_cookies, "authorization") do
          {:ok, token}
        else
          _ -> {:error, :notfound}
        end
    end
  end
end
