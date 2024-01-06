defmodule BubbliWeb.Plug.Auth do
  @moduledoc false
  import Plug.Conn

  require Logger

  def init(opts) do
    opts
  end

  def call(conn, opts) do
    BubbliWeb.UserAuth.fetch_api_user(conn, opts)
  end

  # DEPRECATED in favor of user_auth.ex
  # def call(conn, _opts) do
  #   with {:ok, token} <- get_auth_token(conn),
  #        {:ok, data} <- BubbliWeb.Token.verify(token) do
  #     assign(conn, :current_user, Bubbli.get_user(data.user_id))
  #   else
  #     {:error, error} ->
  #       Logger.info("Error authenticating request, #{error}")

  #       conn
  #       |> put_status(:unauthorized)
  #       |> Phoenix.Controller.put_view(BubbliWeb.ErrorJSON)
  #       |> Phoenix.Controller.render(:"401")
  #       |> halt()
  #   end
  # end

  # def get_auth_token(conn) do
  #   case get_req_header(conn, "authorization") do
  #     ["Bearer" <> token] ->
  #       {:ok, token}

  #     _ ->
  #       case Map.fetch(conn.req_cookies, "authorization") do
  #         {:ok, token} -> {:ok, token}
  #         _ -> {:error, :notfound}
  #       end
  #   end
  # end
end
