defmodule BubbliWeb.AuthenticationController do
  use BubbliWeb, :controller

  require Logger

  action_fallback(BubbliWeb.FallbackController)

  def login(conn, %{"email" => email, "master_password_hash" => pw_hash_base64, "client_key_type" => client_key_type}) do
    # TODO: convert to ecto schemaless payload validation
    {:ok, password_hash} = Base.decode64(pw_hash_base64)

    with {:ok, user} <- Bubbli.get_user_by(email: email),
         :ok <- Bubbli.verify_user(user, password_hash),
         {:ok, client_key} <- Bubbli.get_client_key_by_user_and_type(user, client_key_type),
         token <- Bubbli.create_user_api_token(user) do
      conn
      |> put_status(:ok)
      |> Plug.Conn.put_resp_cookie("authorization", token,
        http_only: true,
        same_site: "Strict",
        secure: true,
        max_age: 60 * 60 * 24
      )
      |> render(:successfully_authenticated, %{user: user, client_key: client_key})
    else
      {:error, :user_not_found} ->
        conn |> put_status(404) |> render(:failed_login, error: :user_not_found)

      {:error, error} ->
        Logger.warning("failed login - #{inspect(error)}")
        conn |> put_status(400) |> render(:failed_login, error: :unknown)
    end
  end

  def logout(conn, _) do
    conn
    |> put_status(:ok)
    |> BubbliWeb.UserAuth.log_out_user()
    # |> put_resp_cookie("authorization", "",
    #   http_only: true,
    #   same_site: "Strict",
    #   secure: true,
    #   max_age: 0
    # )
    |> render(:logout)
  end
end
